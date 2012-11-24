Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {
      this.splice(i, 1);
      i--;}}
  return this}

function Env(dict) {
  var  env = {}, outer = dict.outer || {};
  if (dict.parms.length != 0) {
    for (var i = 0; i < dict.parms.length; i += 1) {
      env[dict.parms[i]] = dict.args[i];}}
   env.find = function (variable) {
     if (env.hasOwnProperty(variable)) {
       return env
    } else {
       return outer.find(variable)}}
  return env
}

function add_globals(env){
  env['+'] = function(a,b) {return a + b}
  env['-'] = function (a, b) {return a - b}
  env['*'] = function (a, b) {return a * b}
  env['/'] = function (a, b) {return a / b}
  env['>'] = function (a, b) {return a > b}
  env['<'] = function (a, b) {return a < b}
  env['>='] = function (a, b) {return a >= b}
  env['<='] = function (a, b) {return a <= b}
  env['=='] = function (a, b) {return a == b}
  env['equal?'] = function (a, b) {return a == b}
  env['eq?'] = function (a, b) {return a == b}
  env['not'] = function (a) {return !a}
  env['length'] = function (x) { return x.length }
  env['cons'] = function (x, y) {return [x].concat(y) }
  env['car'] = function (x) { return x[0]}
  env['cdr'] = function (x) { return x.slice(1)} 
  env['append'] = function (x, y) { return x.concat(y) }
  env['list'] = function () {var res = [];
                             for(var i = 0; i< arguments.length;i++){
                               res.push(arguments[i])}
                             return res}
  env['list?'] = function (x) { return (x instanceof Array)}
  env['null?'] = function (x) { return (x.length == 0) }
  env['symbol?'] = function (x) { return (typeof x == 'string') }
  return env
}

var global_env = add_globals(Env({parms: [], args: []}));

function eval(x, env) {
  env = env || global_env;
  if (typeof x == 'string') {
    return env.find(x)[x]}
  else if (typeof x == 'number') {
    return x}
  else if (x[0] == 'quote') {
    return x[1]}
  else if (x[0] == 'if') {
    var test = x[1],conseq = x[2],alt = x[3];
    if (eval(test, env)) {
      return eval(conseq, env)}
    else {
      return eval(alt, env) }}
  else if (x[0] === 'set!') {
    env.find(x[1])[x[1]] = eval(x[2], env);} 
  else if (x[0] === 'define') {
    env[x[1]] = eval(x[2], env);} 
  else if (x[0] === 'lambda') {
    var vars = x[1],exp = x[2];
    return function () {
      return eval(exp, Env({parms: vars, args: arguments, outer: env }))}} 
  else if (x[0] === 'begin') {
    var val;
    for (var i = 1; i < x.length; i += 1) {
      val = eval(x[i], env);}
    return val} 
  else {
    var exps = [];
    for (i = 0; i < x.length; i += 1) {
      exps[i] = eval(x[i], env);}
    var proc = exps.shift();
    return proc.apply(env, exps)}}

function read(string){
  return read_from(tokenize(string))}

function tokenize(s){
  return s.replace(/\(/g," ( ").replace(/\)/g," ) ").split(" ").clean('')}

function read_from(tokens){
  if(tokens.length == 0)
    throw "SyntaxError"
  var token = tokens.shift();
  if (token == '('){
    var L = [];
    while(tokens[0] != ')'){
    L.push(read_from(tokens));}
    tokens.shift();
    return L}
  else{
    if (token == ')'){
    throw "syntax error"
    } else {
      return atom(token)
    }}}

function atom(token) {
    if (isFinite(token)){
      return Number(token)}
    else{
      return token}}

function repl() {
  var stdin = process.stdin, stdout = process.stdout;
  stdin.resume();
  stdout.write("==> ");
  stdin.on('data',function(data){
  data = data.toString().trim();
  var result = eval(read(data))
  if (result != undefined) {
    stdout.write(result+'\n==> ');}
  else {stdout.write('==> ');}})}
  
repl()
