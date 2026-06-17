package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strings"
	"syscall/js"

	"github.com/bufbuild/protocompile"
	"github.com/bufbuild/protocompile/experimental/protoscope"
	"github.com/bufbuild/protocompile/reporter"
	"github.com/sudorandom/fauxrpc"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/encoding/prototext"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/reflect/protoregistry"
	"google.golang.org/protobuf/types/descriptorpb"
	"google.golang.org/protobuf/types/dynamicpb"
)

func main() {
	fmt.Println("WASM Proto Parser Initialized")
	js.Global().Set("parseProto", js.FuncOf(parseProto))
	js.Global().Set("generateFakeData", js.FuncOf(generateFakeData))
	js.Global().Set("formatPrototext", js.FuncOf(formatPrototext))
	js.Global().Set("formatProtoscope", js.FuncOf(formatProtoscope))
	select {}
}

func formatProtoscope(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return js.ValueOf(map[string]any{"error": "missing arguments: binaryData"})
	}

	binaryData := make([]byte, args[0].Get("length").Int())
	js.CopyBytesToGo(binaryData, args[0])

	out, err := protoscope.Disassemble(binaryData, protoscope.DisassembleOptions{})
	if err != nil {
		return js.ValueOf(map[string]any{"error": err.Error()})
	}
	return js.ValueOf(out)
}

func formatPrototext(this js.Value, args []js.Value) any {
	if len(args) < 3 {
		return js.ValueOf(map[string]any{"error": "missing arguments: messageName, fileDescriptorSet, jsonString"})
	}

	messageName := args[0].String()
	fdsBytes := make([]byte, args[1].Get("length").Int())
	js.CopyBytesToGo(fdsBytes, args[1])
	jsonString := args[2].String()

	fds := &descriptorpb.FileDescriptorSet{}
	if err := proto.Unmarshal(fdsBytes, fds); err != nil {
		return js.ValueOf(map[string]any{"error": "failed to unmarshal file descriptor set: " + err.Error()})
	}

	files, err := protodesc.NewFiles(fds)
	if err != nil {
		return js.ValueOf(map[string]any{"error": "failed to create protoregistry: " + err.Error()})
	}

	desc, err := files.FindDescriptorByName(protoreflect.FullName(messageName))
	if err != nil {
		return js.ValueOf(map[string]any{"error": "failed to find message descriptor: " + err.Error()})
	}

	messageDesc, ok := desc.(protoreflect.MessageDescriptor)
	if !ok {
		return js.ValueOf(map[string]any{"error": "descriptor is not a message: " + messageName})
	}

	msg := dynamicpb.NewMessage(messageDesc)
	
	// Unmarshal options to ignore unknown fields just in case
	unmarshalOpts := protojson.UnmarshalOptions{DiscardUnknown: true}
	err = unmarshalOpts.Unmarshal([]byte(jsonString), msg)
	if err != nil {
		return js.ValueOf(map[string]any{"error": "failed to unmarshal json: " + err.Error()})
	}

	textOpts := prototext.MarshalOptions{
		Multiline: true,
		Indent:    "  ",
	}
	textBytes, err := textOpts.Marshal(msg)
	if err != nil {
		return js.ValueOf(map[string]any{"error": "failed to marshal prototext: " + err.Error()})
	}

	return js.ValueOf(string(textBytes))
}

func generateFakeData(this js.Value, args []js.Value) any {
	if len(args) < 2 {
		return js.ValueOf(map[string]any{"error": "missing arguments: messageName, fileDescriptorSet"})
	}

	messageName := args[0].String()
	fdsBytes := make([]byte, args[1].Get("length").Int())
	js.CopyBytesToGo(fdsBytes, args[1])

	maxDepth := 2
	if len(args) >= 3 && !args[2].IsUndefined() && !args[2].IsNull() {
		maxDepth = args[2].Int()
	}

	fds := &descriptorpb.FileDescriptorSet{}
	if err := proto.Unmarshal(fdsBytes, fds); err != nil {
		return js.ValueOf(map[string]any{"error": "failed to unmarshal file descriptor set: " + err.Error()})
	}

	files, err := protodesc.NewFiles(fds)
	if err != nil {
		return js.ValueOf(map[string]any{"error": "failed to create protoregistry: " + err.Error()})
	}

	desc, err := files.FindDescriptorByName(protoreflect.FullName(messageName))
	if err != nil {
		return js.ValueOf(map[string]any{"error": "failed to find message descriptor: " + err.Error()})
	}

	messageDesc, ok := desc.(protoreflect.MessageDescriptor)
	if !ok {
		return js.ValueOf(map[string]any{"error": "descriptor is not a message: " + messageName})
	}

	msg, err := fauxrpc.NewMessage(messageDesc, fauxrpc.GenOptions{
		MaxDepth: maxDepth,
	})
	if err != nil {
		return js.ValueOf(map[string]any{"error": "failed to generate fake data: " + err.Error()})
	}

	jsonBytes, err := protojson.MarshalOptions{EmitUnpopulated: true, Indent: "  "}.Marshal(msg)
	if err != nil {
		return js.ValueOf(map[string]any{"error": "failed to marshal fake data to JSON: " + err.Error()})
	}

	return js.ValueOf(string(jsonBytes))
}

type compilationError struct {
	File    string `json:"file"`
	Line    int    `json:"line"`
	Col     int    `json:"col"`
	Offset  int    `json:"offset"`
	Message string `json:"message"`
}

func parseProto(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return js.ValueOf(map[string]any{"error": "missing arguments"})
	}

	var files map[string]string
	err := json.Unmarshal([]byte(args[0].String()), &files)
	if err != nil {
		return js.ValueOf(map[string]any{"error": "invalid json: " + err.Error()})
	}

	var compilationErrors []compilationError
	rep := reporter.NewReporter(func(err reporter.ErrorWithPos) error {
		pos := err.GetPosition()
		compilationErrors = append(compilationErrors, compilationError{
			File:    pos.Filename,
			Line:    pos.Line,
			Col:     pos.Col,
			Offset:  pos.Offset,
			Message: err.Unwrap().Error(),
		})
		return nil // Continue to find more errors
	}, nil)

	compiler := protocompile.Compiler{
		Resolver: protocompile.CompositeResolver{
			&protocompile.SourceResolver{
				Accessor: func(path string) (io.ReadCloser, error) {
					content, ok := files[path]
					if !ok {
						return nil, fmt.Errorf("file not found: %s", path)
					}
					return io.NopCloser(strings.NewReader(content)), nil
				},
			},
			protocompile.ResolverFunc(func(path string) (protocompile.SearchResult, error) {
				fd, err := protoregistry.GlobalFiles.FindFileByPath(path)
				if err != nil {
					return protocompile.SearchResult{}, err
				}
				return protocompile.SearchResult{
					Proto: protodesc.ToFileDescriptorProto(fd),
				}, nil
			}),
		},
		Reporter: rep,
	}

	// Compile all files provided in the input
	var fileNames []string
	for name := range files {
		fileNames = append(fileNames, name)
	}

	ctx := context.Background()
	fds, err := compiler.Compile(ctx, fileNames...)
	if err != nil {
		if len(compilationErrors) > 0 {
			errorsJson, _ := json.Marshal(compilationErrors)
			return js.ValueOf(map[string]any{"compilationErrors": string(errorsJson)})
		}

		var errWithPos reporter.ErrorWithPos
		if errors.As(err, &errWithPos) {
			pos := errWithPos.GetPosition()
			e := compilationError{
				File:    pos.Filename,
				Line:    pos.Line,
				Col:     pos.Col,
				Offset:  pos.Offset,
				Message: errWithPos.Unwrap().Error(),
			}
			errorsJson, _ := json.Marshal([]compilationError{e})
			return js.ValueOf(map[string]any{"compilationErrors": string(errorsJson)})
		}
		return js.ValueOf(map[string]any{"error": err.Error()})
	}

	fdpSet := &descriptorpb.FileDescriptorSet{}
	for _, fd := range fds {
		fdpSet.File = append(fdpSet.File, protodesc.ToFileDescriptorProto(fd))
	}

	bytes, err := proto.Marshal(fdpSet)
	if err != nil {
		return js.ValueOf(map[string]any{"error": "marshal error: " + err.Error()})
	}

	// Return as Uint8Array
	uint8Array := js.Global().Get("Uint8Array").New(len(bytes))
	js.CopyBytesToJS(uint8Array, bytes)

	return js.ValueOf(map[string]any{"fileDescriptorSet": uint8Array})
}
