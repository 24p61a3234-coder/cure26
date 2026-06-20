export async function queueSmsNotification({ phone, message }) {
  if (!phone) return { queued: false, reason: 'No phone number supplied' };

  // Production integrations can publish this payload to Twilio, SNS, or any SMS worker.
  console.log('SMS notification ready:', { phone, message });
  return { queued: true };
}
