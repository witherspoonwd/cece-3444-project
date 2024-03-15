export function convertTimeString(string, option){
  if (option === "select"){
    const [hours, minutes] = string.split(':');
    let suffix = 'AM';
    let hour12 = parseInt(hours, 10);
  
    if (hour12 >= 12) {
      suffix = 'PM';
      if (hour12 > 12) {
        hour12 -= 12;
      }
    }
  
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${suffix}`;
  }

  else if (option === "db"){
    const [time, period] = string.split(' ');
    const [hours, minutes] = time.split(':');
  
    let hour24 = parseInt(hours, 10);
  
    if (period.toLowerCase() === 'pm' && hour24 !== 12) {
      hour24 += 12;
    } else if (period.toLowerCase() === 'am' && hour24 === 12) {
      hour24 = 0;
    }
  
    return `${hour24.toString().padStart(2, '0')}:${minutes}:00`;
  }

  return NaN;
}