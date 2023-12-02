class HtmlViwer {
    constructor() {
        this._html = van.state('')
        this._md = van.state('')
        this._ja = van.state('')
        this._el = null
    }
    get element() { return return div({}, this.parse()) }
    get html() { return this._html }
    set html(v) { this._html = v; this.element.innerHTML = this.parseHtml(); }
    get md() { return this._md }
    set md(v) { this._md = v; this.element.innerHTML = this.parseMd(); }
    get ja() { return this._ja }
    set ja(v) { this._ja = v; this.element.innerHTML = this.parseJa(); }
    parse() {
        if ()
    }
    parseHtml() {

    }
    parseMd() {
        marked.parse(this.md)
    }
    parseJa() {

    }
}

van.add(document.body, HtmlViwer.html('...'))
van.add(document.body, HtmlViwer.md('...'))
van.add(document.body, HtmlViwer.ja('...'))

const viewer = HtmlViwer.ja('...')
viewer.ja = '...'
viewer.writingMode = '...'
viewer.colorScheme = '...'
van.add(document.body, viewer.element)

