import { setData } from '../utilities/firebase.js';
import { useUserState } from '../utilities/firebase.js'

const days = ['M', 'Tu', 'W', 'Th', 'F'];
const terms = { F: 'Fall', W: 'Winter', S: 'Spring'};
const meetsPat = /^ *((?:M|Tu|W|Th|F)+) +(\d\d?):(\d\d) *[ -] *(\d\d?):(\d\d) *$/;

const getCourseMeetingData = course => {
    const meets = prompt('Enter meeting data: MTuWThF hh:mm-hh:mm', course.meets);
    const valid = !meets || timeParts(meets).days;
    if (valid) return meets;
    alert('Invalid meeting data');
    return null;
  };

const timeParts = meets => {
    const [match, days, hh1, mm1, hh2, mm2] = meetsPat.exec(meets) || [];
    return !match ? {} : {
        days,
        hours: {
        start: hh1 * 60 + mm1 * 1,
        end: hh2 * 60 + mm2 * 1
        }
    };
};
  
const reschedule = async (course, meets) => {
    if (meets && window.confirm(`Change ${course.id} to ${meets}?`)) {
      try {
        await setData(`/courses/${course.id}/meets`, meets);
      } catch (error) {
        alert(error);
      }
    }
  };
  
  const Course = ({ course, selected, setSelected }) => {
    const isSelected = selected.includes(course);
    const isDisabled = !isSelected && hasConflict(course, selected);
    const [user] = useUserState();
    const style = {
      backgroundColor: isDisabled? 'lightgrey' : isSelected ? 'lightgreen' : 'white'
    };
  
    return (
      <div className="card m-1 p-2" 
          style={style}
          onClick={(isDisabled) ? null : () => setSelected(toggle(course, selected))}
          onDoubleClick={!user ? null : () => reschedule(course, getCourseMeetingData(course))}>
        <div className="card-body">
          <div className="card-title">{ getCourseTerm(course) } CS { getCourseNumber(course) }</div>
          <div className="card-text">{ course.title }</div>
          <div className="card-text">{ course.meets }</div>
        </div>
      </div>
    );
  };

const hasConflict = (course, selected) => (
    selected.some(selection => courseConflict(course, selection))
);

const toggle = (x, lst) => (
    lst.includes(x) ? lst.filter(y => y !== x) : [x, ...lst]
);
  
const getCourseNumber = course => (
    course.id.slice(1, 4)
);

const courseConflict = (course1, course2) => (
    getCourseTerm(course1) === getCourseTerm(course2)
    && timeConflict(course1, course2)
);

const getCourseTerm = course => (
    terms[course.id.charAt(0)]
);

const timeConflict = (course1, course2) => (
    daysOverlap(course1.days, course2.days) && hoursOverlap(course1.hours, course2.hours)
);

const daysOverlap = (days1, days2) => ( 
    days.some(day => days1.includes(day) && days2.includes(day))
);
  
const hoursOverlap = (hours1, hours2) => (
    Math.max(hours1.start, hours2.start) < Math.min(hours1.end, hours2.end)
);

export default Course