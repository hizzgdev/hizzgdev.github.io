---
layout: detail
title: 将goagent添加为linux服务
---

linux系统中的服务只是一个shell脚本，一般只需要只要支持start/stop两个命令参数即可，其它可自行扩展，将脚本添加为服务只需要两步：

1. 将该脚本放到`/etc/init.d/`目录下，脚本文件名即为服务名；
2. 执行`chkconfig --add <name>`。

这是一个最简单的脚本：

    # filename: demo

    case "$1" in
        start)
            echo "start"
            ;;
        stop)
            echo "stop"
            ;;
    esac
    exit

为了测试方便，可以先把该文件保存为`demo`，并添加上可执行权限`chmod +x demo`，执行以下命令进行测试：

    $ ./demo start
    start
    $ ./demo stop
    stop

使用chkconfig添加服务时，chkconfig会要求脚本文件必须添加以下两行注释：

    # chkconfig: 2345 98 9
    # description: goagent service

第一行指明了该服务的运行级别以及启动和关闭的顺序：

* `2345`表示当系统以 2/3/4/5 任意一个运行级别启动时都会自动启动该服务；
* `98`表示系统启动时，该服务启动的时间比较晚，数字越大启动越晚，最大是`99`；
* `9`表示系统关闭时，该服务停止的时间比较早，数字越小关闭越早。

第二行则是对该服务的描述。

添加这两行后，`demo`的内容变成了这样：

    # filename: demo
    # chkconfig: 2345 98 9
    # description: goagent service

    case "$1" in
        start)
            echo "start"
            ;;
        stop)
            echo "stop"
            ;;
    esac
    exit

现在将`demo`复制到`/etc/init.d/`目录下，由于向`/etc/init.d/`目录中添加文件需要有root权限，因此这里使用了`sudo`命令：

    $ sudo cp ./demo /etc/init.d/demo

_(也可以先用`su`命令切换到root账号下，再执行`cp ./demo /etc/init.d/demo`，效果是一样的)_

执行以下命令安装服务：

    $ sudo chkconfig --add demo

_(同样，也可以先用`su`命令切换到root账号下，再执行`chkconfig --add demo`)_ 

这样 demo 服务就安装成功了，可以执行以下命令进行测试：

    $ sudo chkconfig --list | grep demo
    demo         0:off   1:off   2:on    3:on    4:on    5:on    6:off
    $ sudo service demo start
    start
    $ sudo service demo stop
    stop

当然，这个 demo 服务除了输出两行文本外，没有其它任何作用，为了实现启动 goagent 的目标，需要在脚本的 start) 和 stop) 后面添加启动和停止 goagent 的相关命令。

    start)
        cd /path/to/goagent/local
        python proxy.py
        echo "Success"

    stop)
        killall python
        echo "Success"

修改脚本文件，删除刚才添加的服务，重新复制文件到`/etc/init.d/`，重新添加服务即可：

    $ sudo chkconfig --del demo
    $ sudo cp ./demo /etc/init.d/demo
    $ sudo chkconfig --add demo
    $ sudo chkconfig --list | grep demo

这个脚本功能已足够，然而不够安全，毕竟停止的时候杀掉了所有的python进程，可以借助一个临时文件记录goagent运行的pid，关闭时只结束该进程即可：

    #!/bin/bash
    # chkconfig: 2345 98 9
    # description: goagent service

    pidfile="/var/run/goagent.pid"

    case "$1" in
        start)
            cd /path/to/goagent/local
            python proxy.py
            echo $! > $pidfile
        ;;

        stop)
            kill -9 `cat $pidfile`
            rm $pidfile
        ;;
    esac
    exit

至此 goagent 服务脚本已经制作完成，重新添加为服务即可。

还可以为脚本添加一些输出，使服务显得更专业一些：

    #!/bin/bash
    # chkconfig: 2345 98 9
    # description: goagent service


    pidfile="/var/run/goagent.pid"
    env="/path/to/goagent/local"
    progname="goagent"
    prog="/path/to/python/2.7.8/bin/python2.7 proxy.py"

    . /etc/rc.d/init.d/functions

    case "$1" in
        start)
            echo -n "Starting $progname: "
            cd $env
            $prog 1>/dev/null 2>/dev/null &
            echo $! > $pidfile
            echo "OK"
        ;;

        status)
            status -p $pidfile $progname
        ;;

        stop)
            echo -n "Shutting $progname: "
            kill -9 `cat $pidfile`
            echo "OK"
            rm $pidfile
        ;;

        *)
            echo $"Usage: $0 {start|stop|status}"
            exit 2
    esac
    exit
