import EmbraceLogger from "../../src/utils/EmbraceLogger";

const logger = new EmbraceLogger(console);
interface Field {
  name: string;
  fetch: () => Promise<any>;
}

interface Step {
  name: string;
  run: (wizard: Wizard) => Promise<any>;
  isCompleted?: boolean;
  docURL: string;
}

class Wizard {
  private fields: {[name: string]: Field};
  private steps: Step[];
  private fieldValues: {[name: string]: any};

  constructor() {
    this.fields = {};
    this.steps = [];
    this.fieldValues = {};
  }

  public registerField(field: Field) {
    this.fields[field.name] = field;
  }

  public registerStep(step: Step) {
    this.steps = this.steps.concat(step);
  }

  public async fieldValue(field: Field): Promise<any> {
    const value = this.fieldValues[field.name];

    if (value !== undefined) {
      return Promise.resolve(value);
    }

    return field.fetch().then((val: any) => {
      this.fieldValues[field.name] = val;

      return val;
    });
  }

  public fieldValueList(list: Field[]): Promise<any[]> {
    return list.reduce(
      async (chain: Promise<any[]>, field: Field): Promise<any[]> => {
        return chain.then(results =>
          field.fetch().then(res => [...results, res]),
        );
      },
      Promise.resolve([]),
    );
  }

  public getUncompletedSteps(): Step[] {
    return this.steps.filter(step => !step.isCompleted);
  }

  public processSteps(): Promise<any[]> {
    return this.steps.reduce(
      async (chain: Promise<any[]>, step: Step): Promise<any[]> => {
        return chain.then(async results => {
          return step.run(this).then(res => {
            logger.log(`${step.name} was completed`);

            step.isCompleted = true;

            return [...results, res];
          });
        });
      },
      Promise.resolve([]),
    );
  }

  public async runSteps(): Promise<void> {
    return this.processSteps()
      .then(() => {
        logger.log("Done");
      })
      .catch(err => {
        logger.error("Error in setting up Embrace: " + err);

        const uncompletedSteps = this.getUncompletedSteps();

        uncompletedSteps.forEach(uncompletedStep => {
          logger.error(
            `We could not complete: ${
              uncompletedStep.name
            }, Please refer to the docs at ${
              uncompletedStep.docURL ||
              "https://embrace.io/docs/react-native/integration/"
            }`,
          );
        });
      });
  }
}

export default Wizard;
export {Field, Step};
