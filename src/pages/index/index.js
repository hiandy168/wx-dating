// 获取全局应用程序实例对象
/*eslint-disable*/
const app = getApp()
const plugin = require('../../utils/plugin')
const ccFile = require('../../utils/calendar-converter')
const curDate = new Date()
let calendarConverter = new ccFile.CalendarConverter()
let curYear = curDate.getFullYear()
let curMonth = curDate.getMonth()
let curDay = curDate.getDate()
let pageData = {
  dateData: {
    date: "",                //当前日期字符串



    arrIsShow: [],           //是否当前月日期
    arrDays: [],             //关于几号的信息
    arrInfoEx: [],           //农历节假日等扩展信息
    arrInfoExShow: [],       //处理后用于显示的扩展信息


  }
}
//月份天数表
var DAY_OF_MONTH = [
  [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
]
//获取月份天数
var getDayCount = function(year, month){
  return DAY_OF_MONTH[isLeapYear(year)][month];
}
//判断当前年是否闰年
var isLeapYear = function(year){
  if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0))
    return 1
  else
    return 0
}
//获取此月第一天相对视图显示的偏移
var getOffset = function(Year, Month) {
  var offset = new Date(Year, Month, 1).getDay()
  // console.log(offset)
  offset = offset == 0 ? 6 : offset - 1//注意这个转换，Date对象的getDay函数返回返回值是 0（周日） 到 6（周六）
  return offset
}
// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: 'Index page',
    userInfo: {},
    // 51日历api
    vacationUrl: 'http://cfg.51wnl.com/api/getconfigbyparajson.aspx?appid=ios-wnl-free&appver=2&configkey=Vocation_ZH_CN&lastupdate=',
    festivalUrl: 'http://cfg.51wnl.com/api/getconfigbyparajson.aspx?appid=ios-wnl-free&appver=2&configkey=Festival_ZH_CN&lastupdate='

  },
  // 获取51api数据
  get51Api (URL) {
    // let that = this
    let obj = {
      url: URL,
      success (res) {
        let data = res.data.replace(/[()]/g,'')
        let festivalObj = plugin.base64decode(JSON.parse(data).msg)
        console.log(festivalObj)
      }
    }
    wx.request(obj)
  },
  // 设置顶部时间
  topDate (year, month, day) {
    // let that = this
    return year + '年' + month + '月' + day
    // this.setData({
    //   showDate: year + '年' + month + '月' + day
    // })
  },
  // 初始化当前月数据
  initCurDate (year, month, day) {
    var curMonth = month
    var curYear = year
    var curDay = day
    var prevMonthDays = 0
    var nextMonthDays = 0
    var curMonthDays = 0
    // 当月天数
    curMonthDays = getDayCount(curYear, curMonth)
    // 设置顶部日期
    pageData.dateData.date = this.topDate(curYear, curMonth + 1, curDay)
    // 获取当月偏移
    var offset = getOffset(curYear, curMonth)
    console.log('当月偏移'+offset)

    var offset2 = getDayCount(curYear, curMonth) + offset
    console.log('偏移量加天数'+offset2)

    // if ( curMonth === 0) {
    //   prevMonthDays = getDayCount(curYear - 1, 11)
    // } else {
    //   prevMonthDays = getDayCount(curYear, curMonth -1)
    // }
    // if (curMonth === 11) {
    //   nextMonthDays = getDayCount(curYear + 1, 0)
    // } else {
    //   nextMonthDays = getDayCount(curYear, curMonth - 1)
    // }
    if (curMonth === 0) {
      prevMonthDays = getDayCount(curYear - 1, 11)
      nextMonthDays = getDayCount(curYear, curMonth + 1)
    } else if (curMonth === 11) {
      prevMonthDays = getDayCount(curYear, curMonth -1)
      nextMonthDays = getDayCount(curYear + 1, 0)
    } else {
      prevMonthDays = getDayCount(curYear, curMonth -1)
      nextMonthDays = getDayCount(curYear, curMonth + 1)
    }
    // 当前月
    for (var i = 0; i < 42; ++i) {
      pageData.dateData.arrIsShow[i] = i < offset || i >= offset2 ? false : true
      pageData.dateData.arrDays[i] = i - offset + 1
      if (!pageData.dateData.arrIsShow[i]) {
        if ( i < curMonthDays) {
          // console.log(i)
          pageData.dateData.arrDays[i] = i - offset + 1 + prevMonthDays
        } else {
          pageData.dateData.arrDays[i] = i - offset2 + 1
        }
      }
      // 添加阴历相关数据
      var d = new Date(year, month, i - offset + 1)
      var dEx = calendarConverter.solar2lunar(d)
      pageData.dateData.arrInfoEx[i] = dEx
      if ('' != dEx.lunarFestival) {
        pageData.dateData.arrInfoExShow[i] = dEx.lunarFestival
      } else if ('初一' === dEx.lunarDay) {
        pageData.dateData.arrInfoExShow[i] = dEx.lunarMonth + '月'
      } else {
        pageData.dateData.arrInfoExShow[i] = dEx.lunarDay
      }
    }
    // 上个月

    console.log('上个月天数'+prevMonthDays)
    console.log('本月天数'+curMonthDays)
    console.log('下个月天数'+nextMonthDays)
    // for (var i = 0; i < 42; ++i) {
    //   pageData.dateData.arrIsShow[i] = i < offset || i >= offset2 ? false : true
    //   if (pageData.dateData.arrIsShow[i])
    //     continue
    //   if ( i < curMonthDays) {
    //     pageData.dateData.arrDays[i] = i - offset + 1 + prevMonthDays
    //   } else {
    //     pageData.dateData.arrDays[i] = i - offset + 2 - nextMonthDays
    //   }

      // var d = new Date(year, month, i - offset + 1)
      // var dEx = calendarConverter.solar2lunar(d)
      // pageData.dateData.arrInfoEx[i] = dEx
      // if ('' != dEx.lunarFestival) {
      //   pageData.dateData.arrInfoExShow[i] = dEx.lunarFestival
      // } else if ('初一' === dEx.lunarDay) {
      //   pageData.dateData.arrInfoExShow[i] = dEx.lunarMonth + '月'
      // } else {
      //   pageData.dateData.arrInfoExShow[i] = dEx.lunarDay
      // }
    // }

    this.setData({
      dateData: pageData.dateData
    })
  },
  // 上个月
  goLastMonth: function(){
    if (0 == curMonth)
    {
      curMonth = 11;
      --curYear
    }
    else
    {
      --curMonth;
    }
    console.log(curYear)
    console.log(curMonth)
    this.initCurDate(curYear, curMonth, 1)
    this.setData({
      dateData: pageData.dateData,
      detailData: pageData.detailData
    })
  },
  // 下个月
  goNextMonth: function(){
    if (11 == curMonth)
    {
      curMonth = 0;
      ++curYear
    }
    else
    {
      ++curMonth;
    }
    console.log(curYear)
    console.log(curMonth)
    this.initCurDate(curYear, curMonth, 1);
    this.setData({
      dateData: pageData.dateData,
      detailData: pageData.detailData
    })
  },
  // 回到今天
  goToday: function(){
    var curDate = new Date();
    curMonth = curDate.getMonth();
    curYear = curDate.getFullYear();
    curDay = curDate.getDate();
    this.initCurDate(curYear, curMonth, curDay);
    this.setData({
      dateData: pageData.dateData,
      detailData: pageData.detailData
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad () {
    // console.log(' ---------- onLoad ----------')
    // console.dir(app.data)
    app.getUserInfo()
      .then(info => this.setData({ userInfo: info }))
      .catch(console.info)
    // this.get51Api(this.data.vacationUrl)
    // 获取节日信息列表
    this.setData({
      festivalObj: app.data.festivalObj,
      festivalObj2: app.data.festivalObj2
    })
    // 设置顶部时间
    // this.topDate(curYear, curMonth, curDay)
    // 初始化数据
    this.initCurDate(curYear, curMonth, curDay)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    // console.log(' ---------- onReady ----------')
    // console.log(curYear)
    // console.log(curMonth)
    // console.log(curDay)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    // console.log(' ---------- onShow ----------')
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {
    // console.log(' ---------- onHide ----------')
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {
    // console.log(' ---------- onUnload ----------')
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {
    // console.log(' ---------- onPullDownRefresh ----------')
  }
})