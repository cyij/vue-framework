import util from './util'
import ajax from './ajax'

var app = {}
util.extend(app, util)
util.extend(app, ajax)

export default app
