customElements.import = async (src, rename) => {
  let componentImport = document.createElement("component-import");
  componentImport.setAttribute("src", src);
  if (rename) componentImport.setAttribute("rename", rename);
  return await componentImport.connectedCallback();
};
class HTMLGDBaseElement extends HTMLElement {
  #data = [];
  #config = null;
  #document = null;
  constructor(currentDocument = document) {
    super();
    this.#document = currentDocument;
  }
  /**
   * @param {Object} cfg 样式与模板元素引用选择器配置
   * @param {String} cfg.style style元素的选择器 默认为 `style[inject]`
   * @param {String} cfg.template template元素的选择器 默认为 `template`
   */
  set config(cfg) {
    this.#config = cfg;
  }
  /** @param {Array<[String,any]>} value 向style与temple标签暴露出的变量 */
  set data(value) {
    this.#data = value;
  }
  attachShadow(option) {
    const doc = this.#document;
    const shadowRoot = super.attachShadow(option);
    let style = null;
    let template = null;
    if (this.#config?.style) style = doc.querySelector(this.#config.css);
    else style = doc.querySelector("style[inject]");
    if (this.#config?.template)
      template = doc.querySelector(this.#config.template);
    else template = doc.querySelector("template");
    let envCode = "";
    if (this.#data) {
      const code = [];
      const data = this.#data;
      for (let i = 0; i < data.length; i++) code.push(`let ${data[i][0]} = "${data[i][1]}";`);
      envCode = code.join("");
    }
    if (style) {
      const css = new CSSStyleSheet();
      css.replaceSync(new Function(envCode + `return \`${style.innerHTML}\``)());
      shadowRoot.adoptedStyleSheets = [css];
    }
    if (template)
      shadowRoot.innerHTML = new Function(envCode + `return \`${template.innerHTML}\``)();
    return shadowRoot;
  }
}

(() => {
  customElements.define(
    "component-import",
    class extends HTMLElement {
      /** @type {Document} */ #document = null;
      #elementConstructor = null;
      constructor() {
        super();
      }
      create() {
        return new this.#elementConstructor();
      }
      async connectedCallback() {
        const url = this.getAttribute("src");
        const rename = this.getAttribute("rename");
        const customElementsProxy = {
          define: (name, constructor, options) => {
            name = rename ?? name;
            if (!customElements.get(name)) {
              this.#elementConstructor = constructor;
              customElements.define(name, constructor, options);
            }
          },
          get: (name) => customElements.get(rename ?? name),
          upgrade: customElements.upgrade,
          whenDefined: (name) => customElements.whenDefined(rename ?? name),
        };
        this.#document = new DOMParser().parseFromString(await (await fetch(url)).text(),"text/html");
        this.#document.tagReName = this.getAttribute("rename");
        const componentImports = this.#document.querySelectorAll("component-import");
        if (componentImports) {
          for (let i = 0; i < componentImports.length; i++) {
            const componentImport = componentImports[i];
            await customElements.import(
              componentImport.getAttribute("src"),
              componentImport.getAttribute("rename")
            );
          }
        }
        /** @type {HTMLScriptElement} */ const mainScript = this.#document.querySelector("script[main]");
        new Function("document", "HTMLGDBaseElement", "customElements", `HTMLGDBaseElement = class extends HTMLGDBaseElement{constructor(){super(document)}};` + mainScript.textContent)
        (this.#document, HTMLGDBaseElement, customElementsProxy);
      }
    }
  );
})();
