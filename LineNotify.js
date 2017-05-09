var lineTokens = ["<Your line token>"];

function setTrigger() {
    var triggerDay = new Date();
    triggerDay.setHours(19);
    triggerDay.setMinutes(59);
    ScriptApp.newTrigger("myFunction").timeBased().at(triggerDay).create();
}

function deleteTrigger() {
    var triggers = ScriptApp.getProjectTriggers();
    for(var i=0; i < triggers.length; i++) {
        if (triggers[i].getHandlerFunction() == "myFunction") {
            ScriptApp.deleteTrigger(triggers[i]);
        }
    }
}

function myFunction() {
    deleteTrigger();
    date = new Date();
    date.setDate(date.getDate() + 1);
    var text = Utilities.formatDate(date, 'JST', 'yyyy/MM/dd') + "\n";

    var calendar = CalendarApp.getCalendarById('<Your google calendar ID>');
    var events = calendar.getEventsForDay(date);

    for(j in events) {
        var event = events[j];
        var title = event.getTitle();
        if( event.isAllDayEvent() ) {
            text += title + '\n';
        }
        else {
            var start = toTime(event.getStartTime());
            var end = toTime(event.getEndTime());
            text += start + ' - ' + end + " " + title + '\n';
        }
        if( event.getDescription().length > 0 ) {
            text += event.getDescription() + '\n'
        }
    }

    if( events.length > 0 ) {
        text += "\n";
    }
    else {
        text += "予定はありません\n"
    }

    // 天気予報
    var response = UrlFetchApp.fetch("http://weather.livedoor.com/forecast/webservice/json/v1?city=130010"); 
    var weather = JSON.parse(response.getContentText());

    date = new Date();
    date.setDate(date.getDate() + 1);
    for(i=0;i<weather.forecasts.length;i++) {
        var tgtdate = Utilities.formatDate(date, 'JST', 'yyyy-MM-dd');
        if( weather.forecasts[i].date == tgtdate ) {
            w = weather.forecasts[i];
            text += "天気予報：" + w.telop + "\n最低気温：" + w.temperature.min.celsius + "℃\n最高気温：" + w.temperature.max.celsius + "℃";
            break;
        }
    }

    sendToLine(text);
}

function sendToLine(text){
    for(i=0;i<lineTokens.length;i++) {
        var token = lineTokens[i];
        var options =
            {
                "method"  : "post",
                "payload" : "message=" + encodeURIComponent(text),
                "headers" : {"Authorization" : "Bearer "+ token}
            };
        UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
    }
}

function toTime(str){
    return Utilities.formatDate(str, 'JST', 'HH:mm');
}
