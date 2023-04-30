---

title: Cookie 和 Session 工作原理

date: 2023-04-30

---



HTTP协议本身是无状态的，在一次请求和下一次请求之间没有任何状态保持，服务器无法识别来自同一用户的连续请求。有了cookie和session，服务器就可以利用它们记录客户端的访问状态，这样用户就不用在每次访问不同的页面都需要登录



### Cookie工作原理



cookie是一种数据存储技术，它是将一段文本保存在客户端（浏览器或本地电脑）的一种技术，并且可以长时间保存。当用户首次通过客户端访问服务器时，web服务器会发送客户端的一小段信息。客户端浏览器会将这段信息以cookie的形式保存在本地某个目录的文件下。当客户端再次发送请求时会自动携带cookie信息发送给服务器，这样服务器通过cookie信息就可以获取用户的信息



### Cookie应用场景



- 判断用户是否登录
- 记录用户登录信息
- 记录用户搜索的关键词



### Cookie缺点



- 浏览器不一定会保存服务器发来的cookie，用户可以通过设置选择是否禁用cookie
- cookie是有生命周期的（通过Expire设置），如果超过周期，cookie就会被清除
- HTTP数据通过明文发送，容易受到攻击，因此不能在cookie中存放敏感信息（比如信用卡号，密码等）
- cookie以文本形式存储在客户端，用户可以随意更改



### Django使用Cookie



- 提供相应数据时设置cookie（保存到客户端）



```plain
response.set_cookie(cookie_name, value, max_age = None, expires = None) 

# key : cookie的名称
# value : 保存的cookie的值
# max_age: 保存的时间，以秒为单位
# expires: 过期时间，为datetime对象或时间字符串
```



- 获取cookies中的数据，进行处理验证



客户端再次请求时，request会携带本地存储的cookie信息，视图中可以通过request.COOKIES获取cookie信息



```plain
# 方法一
request.COOKIES['username']

# 方法二
request.COOKIES.get('username','')
```



### Cookie使用示例



```plain
# 如果登录成功，设置cookie
def login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
  
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = User.objects.filter(username__exact=username, password__exact=password)

            if user:
                response = HttpResponseRedirect('/index/')
                # 将username写入浏览器cookie,有效时间为360秒
                response.set_cookie('username', username, 360)
                return response
            else:
                return HttpResponseRedirect('/login/')
                                                   
    else:
        form = LoginForm()

    return render(request, 'users/login.html', {'form': form})


# 通过cookie判断用户是否已登录
def index(request):
    # 读取客户端请求携带的cookie，如果不为空，表示为已登录帐号
    username = request.COOKIES.get('username', '')
    if not username:
        return HttpResponseRedirect('/login/')
    return render(request, 'index.html', {'username': username})
```



### Session工作原理



session又名会话，其功能与应用场景与cookie类似，用来存储少量的数据或信息，但由于数据存储在服务器上，而不是客户端，所以安全性高于cookie。不过当会话信息都存储于服务器会对服务器造成一定的压力。



### Django使用Session



- 检查配置选项



确保settings.py开启了SessionMiddleware中间件，django



```plain
'django.contrib.sessions.middleware.SessionMiddleware',
```



- 使用session



request.session是一个字典，你可以在视图和模板中使用它



```plain
# 设置session的值
request.session['key'] = value
request.session.set_expiry(time): 设置过期时间，0表示浏览器关闭则失效

# 获取session的值
request.session.get('key'，None)

# 删除session的值, 如果key不存在会报错
del request.session['key']

# 判断一个key是否在session里
'fav_color' in request.session

# 获取所有session的key和value
request.session.keys()
request.session.values()
request.session.items()
```



### Session使用示例



```plain
# 如果登录成功，设置session
def login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)

        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = User.objects.filter(username__exact=username, password__exact=password)
            if user:
                # 将username写入session，存入服务器
                request.session['username'] = username
                return HttpResponseRedirect('/index/')
            else:
                return HttpResponseRedirect('/login/')
    else:
        form = LoginForm()

    return render(request, 'users/login.html', {'form': form})


# 通过session判断用户是否已登录
def index(request):
    # 获取session中username
    username = request.session.get('username', '')
    if not username:
        return HttpResponseRedirect('/login/')
    return render(request, 'index.html', {'username': username})

# 退出登录
def logout(request):
    try:
        del request.session['username']
    except KeyError:
        pass
    return HttpResponse("You're logged out.")
```