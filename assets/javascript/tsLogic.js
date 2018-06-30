$(document).ready(function() {

  const database = firebase.database();
  const ref = database.ref();
  let nextTrain = 0;
  
  $('#addTrain').on('click', function(event){
    event.preventDefault();
    
    let trainName = $('#inputTrainName').val().trim();
    let dest = $('#inputDestination').val().trim();
    let firstTrain = moment($('#inputTrainTime').val(),"HH:mm").format("HH:mm");
    let freq = $('#inputFrequency').val().trim();

    let newTrain = {
        trainName: trainName,
        destination: dest,
        firstTrain: firstTrain,
        frequency: freq
    };
    console.log(newTrain);

    ref.push(newTrain);

    // replace the user input with empty strings
    $('#inputTrainName').val("");
    $('#inputDestination').val("");
    $('#inputTrainTime').val("");
    $('#inputFrequency').val("");

  })

  ref.on('child_added', function (snapshot) {
    // created value variable for easy reference
    let value = snapshot.val();

    // get values from firebase db
    let train = value.trainName;
    let destination = value.destination;
    let frequency = value.frequency;
    let firstTrainTime = value.firstTrainTime;

    // convert first train time into minutes
    let firstTrainTimeMinutes = moment(firstTrainTime,"HH:mm").format('mm'); // cut out the military time minutes
    let firstTrainTimeHour = moment(firstTrainTime,"HH:mm").format('hh');  // cut out the military time hours
    let convertHoursToMinutes = firstTrainTimeHour * 60;  // convert hours into minutes
    let firstTrainMinutesPastMidnight = parseInt(convertHoursToMinutes) + parseInt(firstTrainTimeMinutes);  // add converted hours + minutes

    console.log(train + " = TRAIN NAME");
    console.log(firstTrainTime + " = DEPARTS AT")
    console.log(firstTrainMinutesPastMidnight + " = first train time after midnight");

    // time now converted into minutes
    let now = moment().format('HH:mm');  // time now converted to military time
    let timeNowHour = moment(now, "HH:mm").format('HH');  // cut out military time hours
    let timeNowHoursToMinutes = timeNowHour * 60;  // converts hours to minutes
    let timeNowMinutes = moment(now, "HH:mm").format('mm');  // cut out military time minutes
    let timeNowMinutesPastMidnight = parseInt(timeNowHoursToMinutes) + parseInt(timeNowMinutes);  // add minutes together

    console.log(now + " = the time right now");
    console.log(timeNowMinutesPastMidnight + " = time right now after midnight");

    
    let minutesAway = returnMinutesAway(firstTrainMinutesPastMidnight, timeNowMinutesPastMidnight, frequency);
    let nextArrival = returnNextArrival(minutesAway);

    console.log(returnMinutesAway(firstTrainMinutesPastMidnight, timeNowMinutesPastMidnight, frequency) + " = next train time");

    $('.trainSchedule').append(`
        <tr>
            <td id="train" class="text-center">${train}</td>
            <td id="destination" class="text-center">${destination}</td>
            <td id="frequency" class="text-center">${frequency}</td>
            <td id="next-arrival" class="text-center"> ${nextArrival} </td>
            <td id="minutes-away" class="text-center"> ${minutesAway} </td>
        </tr>
    `)
  })

  //FUNCTION WILL RUN TIME NOW IN MINUTES PAST MIDNIGHT AGAINST A FOR LOOP UP TO 1440(MINUTES IN 24 HOURS) WHERE INTERVAL IS EQUAL TO TRAIN FREQUENCY: 
  let returnMinutesAway = function (firstTrainMins, timeNow, interval) {

    let first = parseInt(firstTrainMins);
    let time = parseInt(timeNow);
    let int = parseInt(interval);

    for (let m = first; m < 1440; m += int) {
        if (time < m) {
            let nextTrain = (m - time);
            return nextTrain;
        } else {
            console.log('TRAIN PASSED');
        }
    }

  }

  //FUNCTION WILL RETURN TIME OF NEXT TRAIN USING MINUTES AWAY + TIME NOW -- CONVERTED TO AM/PM USING MOMENT.JS

  let returnNextArrival = function (minsAway) {
    let now = moment().format("HH:mm");
    let nextArrivalTime = moment(now, "HH:mm").add(minsAway, 'm').format('hh:mm A');
    return nextArrivalTime;
  }

})