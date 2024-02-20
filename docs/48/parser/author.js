class Author {
    constructor() {
        this._uuid = van.state(crypto.randomUUID()) // 同名でも重複しないように
        this._created = van.state(new Date())
        this._name = van.state('') // 山田《やまだ》太郎《たろう》（表示名。検索キーワード）
        this._code = van.state('') // yamada-taro（ファイル名、ディレクトリ名、リポジトリ名）
    }
    get uuid() { return this._uuid.val }
    get created() { return this._created.val }
    get name() { return this._name.val }
    get code() { return this._code.val }
    set uuid(v) { this._uuid.val = v }
    set created(v) { this._created.val = v }
    set name(v) { this._name.val = v }
    set code(v) { this._code.val = v }
    get yaml() {
        return jsyaml.dump({name:this.name, code:this.code, created:this.created, uuid:this.uuid})
    }
        
}
