(function(){
class DropItem {
    constructor() { this.files=[]; }
    async readFile(e, textarea, htmlViewer) {
        console.log(Array.from(e.dataTransfer.items))
        console.log(Array.from(e.dataTransfer.files))
        if (0 === e.dataTransfer.files.length) { return; }
        if (1 < e.dataTransfer.files.length) { alert('ドラッグ＆ドロップできるファイルは一つだけです。'); return; }
        this.#readTextFile(e.dataTransfer.files[0], textarea, htmlViewer)
    }
    #readTextFile(file, textarea, htmlViewer) {
        console.log(file)
        console.log(file.type)
        console.log(htmlViewer)
        console.log(htmlViewer.parser)
        // 拡張子txtのみ許可する。内容がテキストでも拡張が違えば弾いてしまう
//        if ('text/plain' !== file.type) { alert('ドラッグ＆ドロップできるのはテキストファイルだけです。（MIME Type: text/plain）'); return; }
        if (confirm('テキストエリアの内容を消して、ファイル内容に置き換えます。\nよろしいですか？')) {
            const reader = new FileReader();
            //reader.onload = () => { textarea.value = reader.result }
            reader.onload = () => {
                textarea.value = reader.result
                if (htmlViewer) { htmlViewer.htmls = htmlViewer.parser.toHtmls(textarea.value) }
            }
            reader.readAsText(file)
        }
    }
    async gets(e) { // https://qiita.com/KokiSakano/items/a122bc0a1a368c697643
        console.log(`DropItem.gets(e)`)
        console.log(Array.from(e.dataTransfer.files))
        console.log(Array.from(e.dataTransfer.items))
        this.files.splice(0)
        await Promise.all(Array.from(e.dataTransfer.items).map(item=>{
            return new Promise((resolve) => {
                const entry = item.webkitGetAsEntry();
                if (!entry) {resolve;return;}
                resolve(this.#searchFile(entry));
            })}))
    }
    async #searchFile(entry) {
        console.log(entry)
        if (entry.isFile) { this.getFile(entry) }
        else if (entry.isDirectory) {
            for await (const ent of this.readAllEntries(entry)) { await this.#searchFile(ent) }
        }
    }
    async getFile(entry) {
        const file = await new Promise((resolve) => {
            entry.file((file) => {
                Object.defineProperty(file, "webkitRelativePath", {value: entry.fullPath})
                resolve(file);
            });
        });
        this.files.push(file);
    }
    #getEntries(entry) { 
        const dirReader = entry.createReader();
        return new Promise((resolve) => { dirReader.readEntries((entries)=>{resolve(entries)}) });
    }
    async #readAllEntries(entry) {
        let allEntries = [];
        const entries = await getEntries(entry);
        if (0 < entries.length) {
            allEntries = allEntries.concat(entries);
            await this.readAllEntries(entry);
        }
        return allEntries
    }
}
window.DropItem = new DropItem()
})()

