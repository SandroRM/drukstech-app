# camera

Camera capture component for photos and video.

- **onCapture**: `(uri) => void` - Callback with captured image URI
- **facingMode**: `"front" | "back"` - Camera direction

```jsx
<camera onCapture={(uri) => savePhoto(uri)} facingMode="back" />
```
