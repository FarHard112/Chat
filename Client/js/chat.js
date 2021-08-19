$(function() {

    const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:5001/chathub").build();
    connection.start();
    $('.disabled').attr("disabled", "disabled");

    $('#btnUserLogin').click(() => {
        const NickName = $('#txtNickName').val();
        connection.invoke("GetNickName", NickName);
        $('.disabled').removeAttr('Disabled');
        $('.disabled').removeClass('disabled');
    });


    $('body').on("click", ".users", function() {
        $('.users').each((index, item) => {
            item.classList.remove("active");
        });
        $(this).addClass("active");
    });

    connection.on("userJoined", NickName => {
        $('#clientJoinAlert').html(`${NickName} daxil oldu ...`);

        $('#clientJoinAlert').fadeIn(2000, () => {
            setTimeout(() => {
                $('#clientJoinAlert').fadeOut(2000);
            }, 2000);
        });
    });
    connection.on("clients", clients => {
        $('#_clients').html("");
        $.each(clients, (index, items) => {
            const user = $('.users').first().clone();
            user.removeClass("active");
            user.html(items.nickName);
            // user.html(items.NickName);
            $('#_clients').append(user);
        });
    });
    connection.on("receiveMessage", (message, nickName) => {
        const _message = $('.message').clone();
        _message.removeClass('message');
        _message.find("p").html(message);
        _message.find("h5")[0].innerHTML = nickName;
        $('.messages').append(_message);
    });


    $('#btnSendMessage').click(() => {
        const clientName = $('.users.active').first().html();
        const message = $('#messageArea').val();
        connection.invoke("SendMessageAsync", message, clientName);

        const _message = $('.message').clone();
        _message.removeClass('message');
        _message.find("p").html(message);
        _message.find("h5")[1].innerHTML = "Sən";
        $('.messages').append(_message);
    });

    $('#btnCreateGroup').click(() => {
        const groupName = $('#txtGroupName').val();
        connection.invoke("AddGroup", groupName);
    });

    connection.on("groups", groups => {
        let options = `<option value="-1">Qruplar</option>`;
        $('.rooms').html("");
        $.each(groups, (index, item) => {
            options += `<option value=${item.groupName}>${item.groupName}</option>`
        });
        $('.rooms').append(options);

    });

    $('#btnSelectedGroup').click(() => {

        let groupNames = [];
        console.log($('.rooms option:selected').html());
        $('.rooms option:selected').map((i, e) => {
            groupNames.push(e.innerHTML);
        });

        connection.invoke("AddClientToGroup", groupNames);
    });

    let _groupName = "";
    $('.rooms').change(function() {
        let groupName = $(this).val();
        _groupName = groupName;
        console.log(groupName);
        connection.invoke("ClientGroup", groupName);
    });

    $('#btnGroupSendMessage').click(() => {
        const groupMessage = $('#messageArea').val();
        if (_groupName != "") {
            connection.invoke("SendMessageToGroup", _groupName, groupMessage);
            const _message = $('.message').clone();
            _message.removeClass('message');
            _message.find("p").html(message);
            _message.find("h5")[1].innerHTML = "Sən";
            $('.messages').append(_message);

        }
    });

});