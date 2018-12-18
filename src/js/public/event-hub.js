window.eventHub = {
  events: [],
  emit(eventName, data) {
    let eventList = this.events[eventName] || [];
    eventList.map((event)=> {
      event.call(undefined, data)
    })
  },
  on(eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn)
  }
}