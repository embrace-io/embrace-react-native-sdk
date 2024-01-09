const inquirer = require('inquirer');

export interface Askable {
  ask: (question: Question) => Promise<Answer>;
}

export interface Question {name: string; message: string; }

export interface Answer {[key: string]: string; }

class Asker implements Askable {
  public answers: Answer;

  constructor() {
    this.answers = {};
  }

  public ask(...question: Question[]): Promise<Answer> {
    const cached: Answer = question.reduce((a: Answer, {name}: Question) => {
      if (this.answers[name]) {
        a[name] = this.answers[name];
      }
      return a;
    }, {});

    if (Object.keys(cached).length === question.length) {
      return Promise.resolve(cached);
    }

    const formatted = question.reduce((a: Question[], question: Question) => {
      if (cached[question.name]) {
        return a;
      }
      return [...a, question];
    }, []).map(({name, message}: Question) => ({type: 'input', name, message}));

    const prompt = inquirer.createPromptModule();
    return prompt(formatted).then((ans: Answer) => {
      if (ans) {
        Object.keys(ans).forEach((key) => {
          this.answers[key] = ans[key];
        });
      }
      return {...cached, ...ans};
    });
  }
}

export default Asker;
