# colorpicker
color picker

## Demo & integration

A small JS color picker plugin

See **demo** at [misliu.github.io/plugins/colorpicker](http://misliu.github.io/plugins/colorpicker)

### Use

```html
    <input type="text" id="color-picker" class="color-picker" />
``` 

```javascript
    new ColorPicker(document.getElementById('color-picker'), {
        dragMove: true,
        showRgbProps: false,
        showTargetBg: true,
        position: 'l b',
        custombg: 'w'
    });
```