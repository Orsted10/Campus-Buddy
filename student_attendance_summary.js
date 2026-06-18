$(document).ready(function () {

    CheckScreen();
    var date = new Date();
    var currentMonth = date.getMonth();
    var currentDate = date.getDate();
    var currentYear = date.getFullYear();
    $("#txtfromdate").datepicker({
        minDate: new Date(currentYear, currentMonth - 1, currentDate),
        maxDate: new Date(currentYear, currentMonth, currentDate),

    });
    $("#txttodate").datepicker({
        minDate: new Date(currentYear, currentMonth - 1, currentDate),
        maxDate: new Date(currentYear, currentMonth, currentDate),

    });

    //$("#txtfromdate").datepicker({ minDate: 30, maxDate: '-1M', numberOfMonths: 2 });
    // $("#txttodate").datepicker({ minDate: 30, maxDate: '-1M', numberOfMonths: 2 });
    $("#txtfromdate").val("");
    $("#txttodate").val("");
    var value = $("#drpfilter").val();

    if (value == "DS") {
        $("#div_filter").css("display", "block");
    }
    else {
        $("#div_filter").css("display", "none");
    }
    $("#drpfilter").change(function () {
        var chk = this.value;
        $("#txtfromdate").val("");
        $("#txttodate").val("");
        if (chk == "DS") {
            $("#div_filter").css("display", "block");
            $("#lbtype").text("Date Wise");
        }
        else {

            $("#div_filter").css("display", "none");
            $("#lbtype").text("Till Date(All days)");
        }
    });

});

function CheckScreen() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // tasks to do if it is a Mobile Device

        $('input[type="button"][value="Print Data"]').hide();

    }
}
function getdata(ctrl) {
    $('#loader-wrapper').css('display', 'block');
    var UID = $(ctrl).parent('td').find('input[type="hidden"]').val();
    //alert('1');
    var course = $(ctrl).attr("chk");
    var code = $(ctrl).attr("obj");
    var fromDate = $("#txtfromdate").val();
    var toDate = $("#txttodate").val();
    var type = $('#drpfilter').val();
    var Sel_Session = $('#ddlSession :selected').val();
    try {
        if (typeof (Sel_Session) == 'undefined') {

            Sel_Session = $('#hfdbSelSes').val();
        }

    } catch (e) {

    }


    $(".CourseCode").html(code);

    if (fromDate == "") {
        fromDate = "0";
    }
    if (toDate == "") {
        toDate = "0";
    }

    $.ajax({

        //url: 'http://uimsapi.cuchd.in/api/StudentAttendance/GetStudentAttendanceReport?course=' + course + '&UID=' + UID + '&fromDate=' + fromDate + '&toDate=' + toDate + '&type=' + type + '&Session=' + Sel_Session,
        //type: "GET",

        url: "frmStudentCourseWiseAttendanceSummary.aspx/GetFullReport",
        data: "{course:'" + course + "',UID:'" + UID + "',fromDate:'" + fromDate + "',toDate:'" + toDate + "',type:'" + type + "',Session:'" + Sel_Session + "'}",
        type: "POST",
        contentType: "application/json; charset=utf-8", ////comment if not required               

        dataType: "json",
        success: function (result) {

            try {
                if (result.d.Result == "No Data Found") {

                    $('#loader-wrapper').css('display', 'none');
                    swal('Error', 'No Attendance detail found !!', 'error');
                    return;
                }
            } catch (e) {

            }

            var objdata = $.parseJSON(result.d.Result);
            //var jsonConvertedData = JSON.stringify(result.d); 
            //var objdata = $.parseJSON(result);
            //var objdata = result.d;
            var finaltype = "";
            var code = "";
            var button = "";
            var chk = "";

            $("#fullreport").html('<thead><tr><th>SrNo</th><th>Date</th><th>Type</th><th>Time</th><th>Attendance</th><th>Section</th><th>Group</th><th>Marked By</th></tr></thead>');
            for (var i = 0; i < objdata.length; ++i) {
                var srno = i + 1;
                button = "none";
                chk = "none";
                var date = objdata[i].AttDate;
                //date = new Date(parseInt(date.replace('/Date(', '')));
                var type = objdata[i].AttendanceType;
                if (type == 'L') {
                    finaltype = "Lecture";
                }
                else if (type == 'P') {
                    finaltype = "Practical";
                }
                else {
                    finaltype = "Tutorial";
                }
                var AttendanceCode = objdata[i].AttendanceCode;
                if (AttendanceCode == "A") {
                    code = "Absent";
                    button = "none";
                }
                else if (AttendanceCode == "P") {
                    code = "Present";
                    if (type == 'P') {

                        //button = "block";
                        if (srno == 1) {
                            if ($(".CourseCode").html() == "20ECP-154") {
                                button = "block";
                                chk = "none";
                            }
                            else {
                                button = "none";
                                chk = "none";
                            }

                        }
                        else {
                            button = "none";
                            chk = "none"; //"block";
                        }

                    } else {
                        button = "none";
                    }
                }
                else { code = AttendanceCode; }



                $('#popupid').css('width', '100%');

                $("#fullreport").append("<tr><td data-label='SrNo'>" + srno + "</td><td data-label='Date'>" + date + "</td><td data-label='Type'>" + finaltype + "</td><td data-label='Time'>" + objdata[i].Timing + "</td><td data-label='Attendance'>" + code + "</td><td data-label='Section'>" + objdata[i].Section + "</td><td data-label='Group'>" + objdata[i].StudentGroup + "</td><td data-label='Marked By'>" + objdata[i].Name + "</td>"
                    + "<td data-label='Feedback'>" +

                    "<input type='button'  Scourse=" + course + " Stype=" + objdata[i].StudentType + " Stiming=" + objdata[i].Studenttiming + " Ssection=" + objdata[i].Section + " Sgroup=" + objdata[i].StudentGroup + " Sdate=" + objdata[i].StuDate +
                    " Scode=" + code + " value='Session analysis' style='display:" + button + "' onClick='GiveFeedback(this)'/><label style='display:" + chk + ";color: green;'>'" + objdata[i].feedbacktext + "'</label></td></tr>");


            }
            $("#div_attend_details").scrollTop(0);

            $('#loader-wrapper').css('display', 'none');

        },
        error: function (errormessage) {
            $('#loader-wrapper').css('display', 'none');
            swal('Error', 'Error in loading Attendance Details, please refresh and try again', 'error');
        }
    });

}
function getReport(UID, Session) {
    $(".overlay").css("display", "block");
    $("#SortTable > tbody").empty();
    $(".Section").html("");
    $(".StudentGroup").html("");
    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: "frmStudentCourseWiseAttendanceSummary.aspx/GetReport",
        data: "{UID:'" + UID + "',Session:'" + Session + "'}",
        success: function (msg) {

            var objdata = $.parseJSON(msg.d);
            $(".name").html(objdata[0].name);
            $(".semester").html(objdata[0].Semester);
            $(".uid").html(objdata[0].UId);

            var TotalCode = [];
            var TotalLecture = [];
            var colorcode = [];
            var totaldelv = 0;
            var totalattd = 0;

            $(".overlay").css("display", "none");
            //alert('1');
            for (var i = 0; i < objdata.length; ++i) {
                var y = '';
                var color = '';

                var Lecture = parseInt(objdata[i].EligibilityPercentage);
                var Code = objdata[i].Code;
                TotalCode.push(Code);
                //if (Lecture > 90)
                //{
                //    Lecture = { y: Lecture, color: '#0e4f1f' }
                //}
                //else if (Lecture >= 80 && Lecture <=90)
                //{
                //    Lecture = { y: Lecture, color: '#56b738' }

                //}
                //else if (Lecture > 75 && Lecture < 80) {
                //    Lecture = { y: Lecture, color: '#e28009' }
                //}
                //else
                //{
                //    Lecture = { y: Lecture, color: 'red' }

                //}

                if (Lecture >= 75) {
                    Lecture = { y: Lecture, color: 'green' }
                }

                else {
                    Lecture = { y: Lecture, color: 'red' }

                }


                TotalLecture.push(Lecture);
                colorcode.push(objdata[i].colorcode);
                totaldelv += Number(objdata[i].Total_Delv);
                totalattd += Number(objdata[i].Total_Attd);
                $("#SortTable").append("<tr><td data-label='Course Code:'>" + objdata[i].Code + "</td><td data-label='Title:'>" + objdata[i].Title +
                    //"</td><td data-label='Lec_Attd:'>" + objdata[i].Lec_Attd + "</td><td data-label='Lec_Delv:'>" + objdata[i].Lec_Delv +
                    //"</td><td data-label='Prac_Attd:'>" + objdata[i].Prac_Attd + "</td><td data-label='Prac_Delv:'>" + objdata[i].Prac_Delv +
                    //"</td><td data-label='Trl_Attd:'>" + objdata[i].Trl_Attd + "</td><td data-label='Trl_Delv:'>" + objdata[i].Trl_Delv +
                    "</td><td data-label='Total_Delv:'>" + objdata[i].Total_Delv + "</td><td data-label='Total_Attd:'>" + objdata[i].Total_Attd +
                    "</td><td data-label='Duty Leave N P:'>" + objdata[i].DutyLeave_N_P +
                    "</td><td data-label='Duty Leave ADL:'>" + objdata[i].DutyLeave_ADL + "</td><td data-label='Duty Leave Others:'>" + objdata[i].DutyLeave_Others + "</td><td data-label='Medical Leave:'>" + objdata[i].MedicalLeave +
                      "</td><td data-label='Eligible Delivered:'>" + objdata[i].EligibilityDelivered +
                       "</td><td data-label='Eligible Attended:'>" + objdata[i].EligibilityAttended +
                      "</td><td data-label='Eligible Percentage:'>" + objdata[i].EligibilityPercentage +
                    "</td><td><input type='hidden' value='" + UID + "' /><input type='button'  chk=" + objdata[i].EncryptCode +
                    " obj=" + objdata[i].Code + " value='View' onClick='getdata(this)'/></td></tr>");   //<td data-label='TotalPercentage:'>" + objdata[i].TotalPercentage + "</td>

            }
            // alert('2');
            var totalPercentage = (totalattd / totaldelv) * 100
            totalPercentage = Math.round(totalPercentage);
            // $("#AttendanceStatus").html(totalPercentage + "%");


            CreateChart(TotalCode, TotalLecture, "");
        }
            ,
        error: function (xhr, ajaxOptions, thrownError) {
        }
    });
}
function CreateChart(TotalCode, TotalLecture, names) {

    Highcharts.chart('container', {
        chart: {
            type: 'column',
            spacingBottom: 15,
        },
        title: {
            text: names
        },

        xAxis: {
            categories: TotalCode,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: ''
            }
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0,

            }
        },
        series: [{
            name: 'Total Percentage',
            data: TotalLecture//,
            // color: '#33cc33'
        }]
    });
}
function Closepopupfunction() {
    $('#popupid').css('width', '0');
}
function printData() {
    var divToPrint = document.getElementById("div_attend_details");
    newWin = window.open("");

    newWin.document.write(divToPrint.innerHTML);
    newWin.print();
    newWin.close();
}

function getDataDateWise() {
    var UID = $('#SortTable').find('input[type="hidden"]').val();
    var fromDate = $("#txtfromdate").val();
    var toDate = $("#txttodate").val();
    var type = $('#drpfilter').val();
    var Sel_Session = $('#ddlSession :selected').val();
    //$(".overlay").css("display", "block");
    $('#loader-wrapper').css('display', 'block');
    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: "frmStudentCourseWiseAttendanceSummary.aspx/GetFullReportDateWise",
        data: "{toDate:'" + toDate + "',fromDate:'" + fromDate + "',type:'" + type + "',UID:'" + UID + "',Session:'" + Sel_Session + "'}",
        success: function (msg) {

            if (msg.d == "Invalid") {
                alert("Please select FromDate and ToDate");
                setTimeout(function () { $("#div_filter").css("display", "block"); }, 3000);
                //$(".overlay").css("display", "none");
                $('#loader-wrapper').css('display', 'none');

                return;
            }
            else if (msg.d == "Invalid date") {
                swal('Error', 'From Date is Greater than the To Date !!', 'error');
                //$(".overlay").css("display", "none");
                $('#loader-wrapper').css('display', 'none');
                return;
            }

            else {
                $("#SortTable > tbody").empty();

                var objdata = $.parseJSON(msg.d);


                $(".name").html(objdata[0].name);
                $(".semester").html(objdata[0].Semester);
                $(".uid").html(objdata[0].UId);
                var TotalCode = [];
                var TotalLecture = [];
                var colorcode = [];
                var totaldelv = 0;
                var totalattd = 0;
                // $(".overlay").css("display", "none");
                $('#loader-wrapper').css('display', 'none');

                for (var i = 0; i < objdata.length; ++i) {
                    var y = '';
                    var color = '';

                    var Lecture = parseInt(objdata[i].EligibilityPercentage);

                    //if (Lecture > 90) {
                    //    Lecture = { y: Lecture, color: '#0e4f1f' }
                    //}
                    //else if (Lecture >= 80 && Lecture <= 90) {
                    //    Lecture = { y: Lecture, color: '#56b738' }

                    //}
                    //else if (Lecture > 75 && Lecture < 80) {
                    //    Lecture = { y: Lecture, color: '#e28009' }
                    //}
                    //else {
                    //    Lecture = { y: Lecture, color: 'red' }

                    //}

                    if (Lecture >= 75) {
                        Lecture = { y: Lecture, color: 'green' }
                    }

                    else {
                        Lecture = { y: Lecture, color: 'red' }

                    }

                    var Code = objdata[i].Code;
                    TotalCode.push(Code);
                    TotalLecture.push(Lecture);
                    colorcode.push(objdata[i].colorcode);
                    totaldelv += Number(objdata[i].Total_Delv);
                    totalattd += Number(objdata[i].Total_Attd);
                    //   $("#SortTable").append("<tr><td data-label='Course Code:'>" + objdata[i].Code + "</td><td data-label='Title:'>" + objdata[i].Title + "</td><td data-label='Lec_Attd:'>" + objdata[i].Lec_Attd + "</td><td data-label='Lec_Delv:'>" + objdata[i].Lec_Delv + "</td><td data-label='Prac_Attd:'>" + objdata[i].Prac_Attd + "</td><td data-label='Prac_Delv:'>" + objdata[i].Prac_Delv + "</td><td data-label='Trl_Attd:'>" + objdata[i].Trl_Attd + "</td><td data-label='Trl_Delv:'>" + objdata[i].Trl_Delv + "</td><td data-label='Total_Delv:'>" + objdata[i].Total_Delv + "</td><td data-label='Total_Attd:'>" + objdata[i].Total_Attd + "</td><td data-label='%'>" + objdata[i].Total_Perc + "</td><td data-label='Duty Leave N P:'>" + objdata[i].DutyLeave_N_P + "</td><td data-label='Duty Leave Others:'>" + objdata[i].DutyLeave_Others + "</td><td data-label='Medical Leave:'>" + objdata[i].MedicalLeave + "</td><td><input type='hidden' value='" + UID + "' /><input type='button'  chk=" + objdata[i].EncryptCode + " obj=" + objdata[i].Code + " value='View' onClick='getdata(this)'/></td></tr>");   //<td data-label='TotalPercentage:'>" + objdata[i].TotalPercentage + "</td>
                    $("#SortTable").append("<tr><td data-label='Course Code:'>" + objdata[i].Code + "</td><td data-label='Title:'>" + objdata[i].Title +
                  //"</td><td data-label='Lec_Attd:'>" + objdata[i].Lec_Attd + "</td><td data-label='Lec_Delv:'>" + objdata[i].Lec_Delv +
                  //"</td><td data-label='Prac_Attd:'>" + objdata[i].Prac_Attd + "</td><td data-label='Prac_Delv:'>" + objdata[i].Prac_Delv +
                  //"</td><td data-label='Trl_Attd:'>" + objdata[i].Trl_Attd + "</td><td data-label='Trl_Delv:'>" + objdata[i].Trl_Delv +
                  "</td><td data-label='Total_Delv:'>" + objdata[i].Total_Delv + "</td><td data-label='Total_Attd:'>" + objdata[i].Total_Attd +
                  "</td><td data-label='Duty Leave N P:'>" + objdata[i].DutyLeave_N_P +
                  "</td><td data-label='Duty Leave ADL:'>" + objdata[i].DutyLeave_ADL + "</td><td data-label='Duty Leave Others:'>" + objdata[i].DutyLeave_Others + "</td><td data-label='Medical Leave:'>" + objdata[i].MedicalLeave +
                    "</td><td data-label='Eligible Delivered:'>" + objdata[i].EligibilityDelivered +
                      "</td><td data-label='Eligible Attended:'>" + objdata[i].EligibilityAttended +
                    "</td><td data-label='Eligible Percentage:'>" + objdata[i].EligibilityPercentage +
                  "</td><td><input type='hidden' value='" + UID + "' /><input type='button'  chk=" + objdata[i].EncryptCode +
                  " obj=" + objdata[i].Code + " value='View' onClick='getdata(this)'/></td></tr>");   //<td data-label='TotalPercentage:'>" + objdata[i].TotalPercentage + "</td>
                    if (type == "DS") {
                        $("#lbtype").text("Date Wise Search between " + fromDate + " to " + toDate);
                    }
                    else {
                        $("#lbtype").text("Till Date(All days)");
                    }
                }
                var totalPercentage = (totalattd / totaldelv) * 100
                totalPercentage = Math.round(totalPercentage);
                CreateChart(TotalCode, TotalLecture, "");

            }
        }

    });
}


//changes on 09 Feb 2021

function GiveFeedback(ctrl) {

    $('#givefeedback').css('width', '100%');

    $('.loading_popup').css('display', 'block');

    var Course = $(ctrl).attr("Scourse");
    var Code = $(ctrl).attr("Scode");
    var Type = $(ctrl).attr("Stype");
    var Timing = $(ctrl).attr("Stiming");
    var Section = $(ctrl).attr("Ssection");
    var Group = $(ctrl).attr("Sgroup");
    var Date = $(ctrl).attr("Sdate");

    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: "frmStudentCourseWiseAttendanceSummary.aspx/ShowFeedback",
        data: "{Course:'" + Course + "',Code:'" + Code + "',Type:'" + Type + "',Timing:'" + Timing + "',Section:'" + Section + "',Group:'" + Group + "',Date:'" + Date + "'}",
        success: function (msg) {
            if (msg.d != '0') {
                var msgs = msg.d;

                msgs = msgs.substring(msgs.indexOf('<div id="divEhcHistoryMessages" class="ClassdivEhcHistoryMessages">'), msgs.indexOf('</form>'));

                $('#divEhcConversation').html(msgs);
                var maxscroll = $('#divEhcConversation')[0].scrollHeight - $('#divEhcConversation').outerHeight();
                $('#divEhcConversation').scrollTop(maxscroll);
                //setTimeout(function () {

                //if ($('.ChatMyMesssageText').css('display') == 'block')
                //{

                //}
                $('.loading_popup').fadeOut(300);
                //}, 500);
            }
            else {
                //window.location = "Login.aspx";
            }
        }
                ,
        error: function (xhr, ajaxOptions, thrownError) {
            // window.location = "Login.aspx";
        }
    });


}
function Closefeedbackfunction() {
    $('#givefeedback').css('width', '0%');
}