package com.typeflow.app;

import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable WebView hardware acceleration and keyboard support
        WebView webView = getBridge().getWebView();
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        // Forward all key events directly to WebView for Bluetooth keyboard support
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.dispatchKeyEvent(event);
        }
        return super.dispatchKeyEvent(event);
    }
}
