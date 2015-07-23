## DateTz: Lightweight timezone aware Date object

    var createIstanbulDate = DateTz.createFactory(2); // 2 is the offset in hours

    var ist_date = createIstanbulDate(2015, 6, 15, 14, 30);
    var ist_now = createIstanbulDate();

    console.log(ist_date.getHours()); // 14
    console.log(ist_date.getUTCHours()); // 12

    console.log(ist_now.getHours()); // 10
    console.log(ist_now.getUTCHours()); // 8

    // etc..
