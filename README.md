# colorpicker
color picker

## Demo & integration

A small JS color picker plugin

See **demo** at [huachaoliu.github.io/plugins/colorpicker](http://huachaoliu.github.io/plugins/colorpicker)

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
