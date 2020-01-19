// +build darwin

// This code is a part of MagicCap which is a MPL-2.0 licensed project.
// Copyright (C) Jake Gealer <jake@gealer.email> 2020.

package platformspecific

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework Webkit
#include <stdlib.h>
#import <WebKit/WebKit.h>
#include "webview_darwin.h"
*/
import "C"
import "unsafe"

// Webview defines the webview handler.
type Webview struct {
	CWebview *C.WKWebView
}

// NewWebview creates a new webview.
func NewWebview(URL string, Title string, Width int, Height int) *Webview {
	URLLen := len(URL)
	URLC := C.CString(URL)
	defer C.free(unsafe.Pointer(URLC))
	TitleLen := len(Title)
	TitleC := C.CString(Title)
	defer C.free(unsafe.Pointer(TitleC))
	return &Webview{CWebview: C.MakeWebview(URLC, C.int(URLLen), TitleC, C.int(TitleLen), C.int(Width), C.int(Height))}
}