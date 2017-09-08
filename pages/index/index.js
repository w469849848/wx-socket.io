// index.js
// 获取应用实例
const app = getApp()
let arrayList = [];
Page({
	data: {
		nickname: '',
		userid: '',
		inputValue: '',
		isshowgreeting: false,
		isshowchatbox: true,
		arrayList: [],
		onlineCount: 0,
		onlineUsers: '',
		scrollTop: 0
	},

	// 事件处理函数
	inputNameEvent: function(event) {
		this.setData({
			nickname: event.detail.value,
		})
	},
	inputValue: function(event) {
		this.setData({
			inputValue: event.detail.value,
		})
	},
	logout: function() {
		wx.closeSocket()
		arrayList = []
		this.setData({
			nickname: '',
			userid: '',
			inputValue: '',
			isshowgreeting: false,
			isshowchatbox: true,
			arrayList: [],
			onlineCount: 0,
			onlineUsers: '',
			scrollTop: 0
		})
	},
	//发送消息
	submit: function(e) {
		var content = this.data.inputValue;
		if(content != '') {
			var obj = {
				userid: this.data.userid,
				username: this.data.nickname,
				content: content
			};
			let socket = app.globalData.socket
			socket.emit('message', obj);
			this.setData({
				inputValue: '',
			})
		}
		return false;
	},
	//提交用户名并进入房间
	enterRoom: function(event) {
		if(!this.data.nickname) {
			return
		}
		this.setData({
			isshowgreeting: true,
			isshowchatbox: false
		})
		app.globalData.nickname = this.data.nickname;
		this.data.userid = this.genUid();
		this.init();
	},
	//随机生成一个用户id
	genUid: function() {
		return new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);
	},
	//更新服务器传过来的消息
	updateSysMsg: function(o, action) {
		var userhtml = '';
		var separator = '';
		let that = this;
		for(let key in o.onlineUsers) {
			if(o.onlineUsers.hasOwnProperty(key)) {
				userhtml += separator + o.onlineUsers[key];
				separator = '、';
				o.type = action;
				// console.log(JSON.stringify(arrayList).indexOf(JSON.stringify(o)))
				if(JSON.stringify(arrayList).indexOf(JSON.stringify(o))==-1){
					arrayList.push(o);
				}
				
			}
		}
		// console.log(arrayList)
		that.setData({
			arrayList: arrayList,
			onlineCount: o.onlineCount,
			onlineUsers: userhtml
		})
		that.getRect();
	},
	//设置滚动条在最底部
	getRect: function() {
		let that = this;
		wx.createSelectorQuery().select('#scroll').boundingClientRect(function(rect) {
			that.setData({
				scrollTop: rect.height
			})
		}).exec()
	},
	onLoad: function() {
		const that = this
		//this.onSocketEvent()
	},

	init: function() {
		let socket = app.globalData.socket;
		let that = this;
		//发送登录信息
		socket.emit('login', {
			userid: that.data.userid,
			username: that.data.nickname
		})
		//接收服务器传递的信息
		socket.on('message', function(obj) {
			console.log(socket)
			var isme = (obj.userid === that.data.userid) ? true : false;

			if(isme) {
				obj.isme = true;
			} else {
				obj.isme = false;
			}
			arrayList.push(obj);
			that.setData({
				arrayList: arrayList,
			})
			that.getRect();
		});
		//监听新用户登录
		socket.on('userlogin', function(o) {
			that.updateSysMsg(o, 'login');
		});

		//监听用户退出
		socket.on('logout', function(o) {
			that.updateSysMsg(o, 'logout');
		});
	}
})