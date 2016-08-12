define('moniter-login', ['jquery', 'dialog'], function($, dialog){
    var usernameDom = $('input[name=username]'),
        passwordDom = $('input[name=password]');
    
    $('.btn.btn-primary').on('click', function(){
        $('#loginFrm').submit();
    });
});