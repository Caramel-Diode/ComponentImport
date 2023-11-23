# Component Import
基于`web component`实现的web component的SFC(单文件组件)库。
使用`html`文件作为单个组件的载体, 可以直接以单文件形式独立预览插件效果。
脚本刚好使用100行实现的效果, 功能比较简单。
## 使用示例
```html
<!-- 必须放置在自定义元素之前 -->
<component-import
    src="目标html文件url"
    rename="标签重命名 可省略">
</component-import>
```
## SFC编写
```html
<!DOCTYPE html>
<html>
<head>
    <!-- 必须引用库脚本 -->
    <script src="script.js"></script>
</head>    
<body>
<style inject>
    /** 样式表 非必要 首个inject属性的style元素样式默认引用 */
</style>
<template>
    <!-- 模板 非必要 首个模板会默认引用 -->
    <!-- 使用js模板字符串插值语法引用暴露出的变量 -->
    <p>${x} + ${y} = ?<p>
</template>
<!-- 在SFC单文件进行预览时 style和template必须出现在script前 否则无法获取元素 -->
<script main>
    /* 脚本 必要 首个main属性的script元素的内容会被执行 */
    /* 你必须继承 HTMLGDBaseElement 才能正常使用 */
    customElements.define("标签-名", class extends HTMLGDBaseElement{
        connectedCallback(){
            /* 向<style>和<template>内容暴露出的变量 */
            this.data = [
                /* [变量名, 值] */
                ["x", 1],
                ["y", 2]
            ];
            /* 自行选择<style>与<template> 值为匹配的选择器文本 */
            this.config = {
                style: "style[inject]",
                template: "template"
            };
            // !!!必须调用attachShadow来加载内容
            this.attachShadow({ mode: "open" });
        }
    });
</script>
</body>
</html>
```