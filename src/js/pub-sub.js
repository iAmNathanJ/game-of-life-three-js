const PubSub = function() {

  const events = {};

  const validateSubscription = function(eventName, cb) {
    if(!eventName) throw new Error('PubSub.on(): no event specified');
    if(typeof eventName !== 'string') throw new Error('PubSub.on(): event name must be string');
    if(!cb) throw new Error('PubSub.on(): no callback specified');
    if(typeof cb !== 'function') throw new Error('PubSub.on(): event callback must be function');
    events[eventName] = Array.isArray(events[eventName]) ? events[eventName] : [];
  };

  const on = function(eventName, cb) {
    validateSubscription(eventName, cb);
    events[eventName].push(cb);
  };

  const off = function(eventName, cb) {
    validateSubscription(eventName, cb);
    let eventIndex = events[eventName].indexOf(cb);
    events[eventName].slice(eventIndex, eventIndex + 1);
  };

  const fire = function(eventName, data) {
    events[eventName].forEach(cb => {
      cb(data);
    });
  };

  return {
    on: on,
    off: off,
    fire: fire
  };
};
