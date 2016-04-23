

module.exports = function(ext) {


'use strict'


/**
 * catogory
 */

var _ = ext._
,local = ext.local
,setting = ext.setting
,tools = ext.tools
,log = ext.log
,err = ext.err
,db = ext.db
,path = require('path')
,baseThemeViewPath = ext.baseThemeViewPath
,Pager = ext.Pager
,pager = ext.pager
,getAllCats = ext.getAllCats

var extend = {}

extend.home = function* (next) {

	try {

		let sea = {}
		let query = this.query
		let page = query.page || 1
		page = parseInt(page, 10) || 1
		let pageSize = query.pageSize || setting.pageSize
		pageSize = parseInt(pageSize, 10) || setting.pageSize

		let user = this.session.user
		this.local.user = user

		let sortOption = {
			createTime: -1
		}

		let total = yield db.collection('post').count(sea)
		let posts = yield db.collection('post').find(sea)
			.skip( (page - 1) * pageSize )
			.limit(pageSize)
			.sort(sortOption)
			.toArray()

		let pagerHtml = pager.render({
			page: page
			,pageSize: pageSize
			,total: total
			,url: this.path
		})

		var cats = yield getAllCats()

		_.extend(this.local, {
			pager: pagerHtml
			,pageSize: pageSize
			,total: total
			,posts: posts
			,themeRes: this.local.host + '/' + setting.theme
			,publicRoute: setting.publicRoute
			,createUrl: tools.createUrl
			,cats: cats
		})

		this.render(baseThemeViewPath + 'home', this.local)

	} catch(e) {

		err('failed render home page', e)
		this.status = 500
		this.local.error = e
		this.render('views/page/500', this.local)

	}

}

extend.post = function* (next) {

	try {

		let params = this.params
		let sea = tools.createQueryObj(params, [':_id', ':id', ':slug'])
		if(!sea) return yield next

		let user = this.session.user
		this.local.user = user

		let post = yield db.collection('post').findOne(sea)

		if(!post) return yield next

		var cats = yield getAllCats()

		_.extend(this.local, {
			post: post
			,publicRoute: setting.publicRoute
			,createUrl:tools.createUrl
			,themeRes: this.local.host + '/' + setting.theme
			,cats: cats
		})
		
		this.render(baseThemeViewPath + '/post', this.local)

	} catch(e) {

		err('failed render single post page', e)
		this.status = 500
		this.local.error = e
		this.render('views/page/500', this.local)

	}

}

extend.cat = function* (next) {

	try {

		let params = this.params
		let query = this.query
		let sea = tools.createQueryObj(params, [':_id', ':id', ':slug'])
		if(!sea) return yield next

		let catObj = yield db.collection('cat').findOne(sea)
		if(!catObj) return yield next

		let page = query.page || 1
		page = parseInt(page, 10) || 1
		let pageSize = query.pageSize || setting.pageSize
		pageSize = parseInt(pageSize, 10) || setting.pageSize

		let user = this.session.user
		this.local.user = user

		let sea1 = {
			'cats._id': catObj._id
		}

		let sortOption = {
			createTime: -1
		}

		let total = yield db.collection('post').count(sea1)
		let posts = yield db.collection('post').find(sea1)
			.skip( (page - 1) * pageSize )
			.limit(pageSize)
			.sort(sortOption)
			.toArray()

		var cats = yield getAllCats()

		let pagerHtml = pager.render({
			page: page
			,pageSize: pageSize
			,total: total
			,url: this.path
		})

		_.extend(this.local, {
			posts: posts
			,page: page
			,pageSize: pageSize
			,total: total
			,cat: catObj
			,pager: pagerHtml
			,themeRes: this.local.host + '/' + setting.theme
			,publicRoute: setting.publicRoute
			,createUrl: tools.createUrl
			,cats: cats
		})

		this.local.posts = posts

		this.render(baseThemeViewPath + 'category', this.local)

	} catch(e) {

		err('failed render cat page', e)
		this.status = 500
		this.local.error = e
		this.render('views/page/500', this.local)

	}

}


return extend

////end
}
