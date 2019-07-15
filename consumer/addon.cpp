#include <node.h>
#include <iostream>
#include <string>

using namespace v8;
using namespace std;

void ProcessData(const FunctionCallbackInfo<Value>& args) {
   String::Utf8Value val(args[0]->ToString());
   string str (*val);
   int length = str.length();
   args.GetReturnValue().Set(length);
}

void Initialize(Local<Object> exports) {
   NODE_SET_METHOD(exports, "processData", ProcessData);
}

NODE_MODULE(addon, Initialize);