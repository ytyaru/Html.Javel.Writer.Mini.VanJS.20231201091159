(function(){
class AppStyle {
    constructor() {
        this.width = van.state(document.documentElement.clientWidth)
        this.height = van.state(document.documentElement.clientHeight)
        this.blockSize = van.state(document.documentElement.clientHeight)
        this.inlineSize = van.state(document.documentElement.clientWidth)
        this.longSize = van.derive(()=>(this.height.val <= this.width.val) ? this.width.val : this.height.val)
        this.shortSize = van.derive(()=>(this.height.val <= this.width.val) ? this.width.val : this.height.val)
        this.longDir = van.derive(()=>(this.height.val <= this.width.val) ? '横長' : '縦長')
        this.menuBlockSize = van.state(32)
        this.uiWidth = van.state(this.width.val)
        this.uiHeight = van.state(((this.height.val - this.menuBlockSize.val) / 2))
        this.gridTemplateColumns = van.state(`${this.uiWidth.val}px ${this.menuBlockSize.val}px ${this.uiWidth.val}px`)
        this.gridTemplateRows = van.state(`${this.uiHeight.val}px`)
    }
    setup() {
        new ResizeObserver(entries=>{
            for (let entry of entries) { this.#resize(entry.contentRect.width, entry.contentRect.height) }
        }).observe(document.querySelector('body'));
        document.querySelector(':root').style.setProperty('--block-size', `${this.blockSize.val}px`)
        document.querySelector(':root').style.setProperty('--inline-size', `${this.inlineSize.val}px`)
    }
    style() { return `display:grid;grid-template-columns:${this.gridTemplateColumns.val};grid-template-rows:${this.gridTemplateRows.val};inline-size:${this.inlineSize.val};block-size:${this.blockSize.val};` }
    #resize(W=0, H=0) {
        if (0===W) { W = document.documentElement.clientWidth }
        if (0===H) { H = document.documentElement.clientHeight }
        if (this.width.val !== W) { this.width.val = W }
        if (this.height.val !== H) { this.height.val = H }
        this.#gridTemplate()
        this.inlineSize.val = W
        this.blockSize.val = H
    }
    #isLandscape() { return ('横長'===this.longDir.val) }
    #isPortrait() { return ('縦長'===this.longDir.val) }
    #gridTemplate() {
        this.uiWidth.val = (this.#isLandscape()) ? ((this.width.val - this.menuBlockSize.val) / 2) : this.width.val
        this.uiHeight.val = (this.#isLandscape()) ? this.height.val : ((this.height.val - this.menuBlockSize.val) / 2)
        const landscapeSizes = [`${this.uiWidth.val}px ${this.menuBlockSize.val}px ${this.uiWidth.val}px`, `${this.uiHeight.val}px`]
        const portraitSizes = [`${this.uiWidth.val}px`, `${this.uiHeight.val}px ${this.menuBlockSize.val}px ${this.uiHeight.val}px`]
        const sizes = (this.#isLandscape()) ? landscapeSizes : portraitSizes
        this.gridTemplateColumns.val = sizes[0]
        this.gridTemplateRows.val = sizes[1]
    }
}
window.appStyle = new AppStyle()
})()
