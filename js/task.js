class Task {
  constructor(agent, job, jobParams, completionCheck, onComplete, onCompleteParams, continuous) {
    this.agent = agent;
    this.job = job;
    this.jobParams = jobParams;
    this.completionCheck = completionCheck;
    this.onComplete = onComplete;
    this.onCompleteParams = onCompleteParams;
    this.isComplete = false;
    this.inProgress = false;
    this.continuous = continuous;
  }
  
  start() {
    this.inProgress = true;
    this.job.apply(this.agent, this.jobParams);
  }
  
  update() {
    if (this.completionCheck.apply(this.agent))
      this.complete();
    else if (this.continuous)
      this.job.apply(this.agent, this.jobParams);
  }
  
  complete() {
    this.isComplete = true;
    if (this.onComplete)
      this.onComplete.apply(this.agent, this.onCompleteParams);
  }
}