(function(){
const {table,tr,th,td,a} = van.tags
class WebService {
    constructor() {
        this._items = new Map()
        this._items.set('github', {category:'hosting', name:'GitHub', domain:'github.com', user:{id:null, name:''}})
        this._items.set('mastodon', {category:'sns', name:'Mastodon', instances:new Map([['mstdn.jp', ({user:{id:null, name:''}})],['mastodon-japan.net', ({user:{id:null, name:''}})]])})
        this._items.set('misskey', {category:'sns', name:'Misskey', instances:new Map([['nijimiss.moe', ({user:{id:null, name:''}})], ['misskey-square.net', ({user:{id:null, name:''}})]])})
        console.log(this._items.entries())
//        console.log(Array.from(this._items.entries()).map(([k,v])=>console.log(k, v)))
//        console.log(Array.from(this._items.entries()).filter(([k,v])=>k).map(([k,v])=>console.log(k, v)))
        console.log(Array.from(this._items.entries()).filter(([k,v])=>{console.log('filter:',k,v);return k;}).map(([k,v])=>console.log(k, v)))
        console.log(this.array.map(([k,v])=>console.log(k, v)))
        console.log(this.array.length)
    }
    get items() { return this._items }
    //get silos() { return services.values.filter((v)=>!v.hasOwnProperty('instances')) } // 営利系サービス
    //get federateds() { return services.values.filter((v)=>v.hasOwnProperty('instances')) } // 連合系サービス
    //get silos() { return new Map(this._items.entries().map((k,v)=>(!v.hasOwnProperty('instances')) ? ([k,v]) : null).filter(v=>v)) } // 営利系サービス
    get array() { return Array.from(this._items.entries()).filter(([k,v])=>k) }
    get siloArray() { return Array.from(this._items.entries()).filter(([k,v])=>!v.hasOwnProperty('instances')) }
    get federatedArray() { return Array.from(this._items.entries()).filter(([k,v])=>v.hasOwnProperty('instances')) }
    get silos() { return new Map(this.siloArray) } // 営利系サービス
    //federateds(s) { return new Map(this._items.entries().map((k,v)=>((!s || s===k) ? [k, v] : null).filter(v=>v))) } // 連合系サービス
    //federateds(s) { return new Map(this.array.map(([k,v])=>((!s || s===k) ? [k, v] : null).filter(v=>v))) } // 連合系サービス
    federateds(s) { return new Map(this.federatedArray.map(([k,v])=>((!s || (s && s===k)) ? [k, v] : null)).filter(v=>v)) } // 連合系サービス
    addInstance(s, domain, username) { this._items.get(s).instances.set(domain, {user:{id:null, name:username}}) }
    removeInstance(s, domain) { this._items.get(s).instances.delete(domain) }
}
/*
class Instance {
    constructor(serviceKey) {
        this._serviceKey = serviceKey
        this._items = vanX.reactive([])
    }
    makeDomain()
}
*/
class WebServiceTable {
    constructor() {
        this._s = new WebService()
    }
    make() { return table(...this.#makeSilos(), ...this.#makeFederateds()) }
    #makeSilos() { return this._s.siloArray.map(([k,v])=>tr(th({colspan:2},a(this.#extLink({href:`https://${v.domain}/`,style:`display:block;`}), v.name)), this.#user(k))) }
    //#makeSilos() { return this._s.silos.map(([k,v])=>tr(th({colspan:2},a(this.#extLink({href:`https://${v.domain}/`,style:`display:block;`}), v.name)), this.#user(k))) }
    /*
    #makeFederateds() {
return this._s.federateds.map(([k,v],i)=>tr(((0===i) ? th(a(this.#extLink({href:`https://ja.wikipedia.org/wiki/${v.name}`,style:`display:block;`}), v.name)) : ''), th(a(this.#extLink({href:`https://${v.}`})))
    }
    */
    #makeFederateds() {
        const trs = []
        //for (let serviceKey of this.federateds.keys()) {
        for (let serviceKey of this._s.federateds().keys()) {
            trs.push(...this.#makeFederated(serviceKey))
        }
        return trs
        return this.federateds().keys().map(k=>this.#makeFederated(serviceKey)).flat()
    }
    #makeFederated(serviceKey) {
        const trs = []
        //console.log(this._s.federateds(serviceKey))
        //const inss = this._s.federateds(serviceKey).instances
        const inss = this._s.items.get(serviceKey).instances
        console.log(inss)
        //for (let domain of this.federateds.get(serviceKey).instances.keys()) {
        for (let domain of inss.keys()) {
            trs.push(tr(
                //((0===trs.length) ? th({rowspan:this.federateds.get(serviceKey).instances.size()}, a(this.#extLink({href:`https://ja.wikipedia.org/wiki/${v.name}`,style:`display:block;`}), v.name)) : null),
                //((0===trs.length) ? th({rowspan:inss.size}, a(this.#extLink({href:`https://ja.wikipedia.org/wiki/${v.name}`,style:`display:block;`}), v.name)) : null),
                ((0===trs.length) ? th({rowspan:inss.size}, a(this.#extLink({href:`https://ja.wikipedia.org/wiki/${serviceKey}`,style:`display:block;`}), serviceKey)) : null),
                th(a(this.#extLink({href:`https://${domain}/`,style:`display:block;`}), domain)),
                this.#user(serviceKey, domain, inss.get(domain).user.name),
            ))
        }
        return trs
    }
    /*
    #makeFederated() {
        const trs = []
        trs.push()
        for (let serviceKey of this.federateds.keys()) {
            for (let domain of this.federateds[serviceKey].instances.keys()) {
                
            }
        }

        return this._s.federateds.map(([k,v],i)
        return trs
    }
    */
    //#externLinkAttr() { return {target:'_blank', rel:'noopener noreferrer'} }
    #extLink(obj) { return {...obj, target:'_blank', rel:'noopener noreferrer'} }
    #user(s, d, v) { return input({id:`webservice-${s}((d) ? '-'+d: '')`, placeholder:'ユーザ名', value:((v) ? v : '')}) }
}
window.webServiceTable = new WebServiceTable()
})()
