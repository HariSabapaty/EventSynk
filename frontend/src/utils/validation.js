// College email validation
export function isCollegeEmail(email) {
  return email.endsWith('@ssn.edu.in');
}

// Password validation (min 8 chars)
export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

// Date order validation (deadline <= date and deadline >= today)
export function isDateOrderValid(deadline, date) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const eventDate = new Date(date);
  return deadlineDate <= eventDate && deadlineDate >= now;
}
