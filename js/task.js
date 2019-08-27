class Task {
  constructor(agent, job, jobParams, completionCheck, onComplete, onCompleteParams) {
    this.agent = agent;
    this.job = job;
    this.jobParams = jobParams;
    this.completionCheck = completionCheck;
    this.onComplete = onComplete;
    this.onCompleteParams = onCompleteParams;
    this.isComplete = false;
    this.inProgress = false;
  }
  
  start() {
    this.inProgress = true;
    this.job.apply(this.agent, this.jobParams);
  }
  
  update() {
    if (this.completionCheck.apply(this.agent))
      this.complete();
  }
  
  complete() {
    this.isComplete = true;
    this.onComplete.apply(this.agent, this.onCompleteParams);
  }
}