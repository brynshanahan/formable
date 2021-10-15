import "./styles.css";
import { Form, Input, Group, WithField } from "./form";
import { useFormState } from "./form/hooks/use-form-state";
import { Validator } from "./form/validator";
import { SubmitButton } from "./components/SubmitButton";
import { Label } from "./components/Label";
import { stringify } from "./utils/stringify";
import { Log } from "./components/Log";
import { AddRepeaterItem, RemoveRepeaterItem, Repeater } from "./form/repeater";

function UserFields({ prop }: { prop?: string }) {
  return (
    <Group prop={prop}>
      <section>
        <h2>User details</h2>

        <Label label="Username">
          <Input prop="username">
            <Validator required>Username is required</Validator>
          </Input>
        </Label>

        <Label label="Email">
          <Input prop="email">
            <Validator required>
              <div>Email is required</div>
            </Validator>
            <Validator<string>
              isValid={(email) => !!email && email.includes("@")}
            >
              <div>Email must be valid</div>
            </Validator>
          </Input>
        </Label>

        <WithField path="email">
          {(val) =>
            !!val && (
              <Label label="Recieve promotions">
                <Input type="checkbox" prop="promotions">
                  I want promotions
                </Input>
              </Label>
            )
          }
        </WithField>

        <Label label="Age">
          <Input prop="age" type="number" clean />
        </Label>
      </section>
    </Group>
  );
}

function Approvals({ prop = "approvals" }) {
  return (
    <Group prop={prop}>
      <Label label="Approve the terms and conditions">
        <Input type="checkbox" prop="terms">
          <span>Approve</span>
          <Validator required>
            <div>Required</div>
          </Validator>
        </Input>
      </Label>
      <WithField prop="terms">
        {(val) => {
          return val ? (
            <Label label="Double check terms">
              <Input type="checkbox" prop="terms_2">
                <span>label</span>
                <Validator required>
                  <div>Also required</div>
                </Validator>
              </Input>
            </Label>
          ) : null;
        }}
      </WithField>
    </Group>
  );
}

export default function App() {
  const [formState, reset] = useFormState({
    users: [{ username: "Bryn" }]
  });

  return (
    <div className="App">
      <h1>Title</h1>
      <h2>Checkout these nice forms</h2>
      <button onClick={reset}>Reset</button>
      <Form
        state={formState}
        onSubmit={(e: any) => {
          alert("Submit\n\n" + stringify(formState.state.fields, 2));
        }}
      >
        <Repeater
          after={
            <>
              <AddRepeaterItem initialValue={{}}>
                <button>Add</button>
              </AddRepeaterItem>
              <Validator<any[]> isValid={(val) => val && !!val.length}>
                Must have at least one user
              </Validator>
            </>
          }
          prop="users"
        >
          <>
            <UserFields />
            <RemoveRepeaterItem>
              <button>Remove</button>
            </RemoveRepeaterItem>
          </>
        </Repeater>
        <Approvals />
        <SubmitButton />
      </Form>
      <Log state={formState} />
    </div>
  );
}
