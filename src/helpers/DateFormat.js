import moment from 'moment';

moment().format('MMMM Do YYYY, h:mm:ss a'); // September 15th 2023, 5:28:06 pm
moment().format('dddd');                    // Friday
moment().format("MMM Do YY");               // Sep 15th 23
moment().format('YYYY [escaped] YYYY');     // 2023 escaped 2023
moment().format(); // 2023-09-15T17:29:00+08:00
moment().format('LT');   // 5:28 PM
moment().format('LTS');  // 5:28:23 PM
moment().format('L');    // 09/15/2023
moment().format('l');    // 9/15/2023
moment().format('LL');   // September 15, 2023
moment().format('ll');   // Sep 15, 2023
moment().format('LLL');  // September 15, 2023 5:28 PM
moment().format('lll');  // Sep 15, 2023 5:28 PM
moment().format('LLLL'); // Friday, September 15, 2023 5:28 PM
moment().format('llll');