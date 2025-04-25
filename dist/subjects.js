// openauth
import { createSubjects } from "@openauthjs/openauth/subject";
// other libraries
import { object, string } from "valibot";
// The access token is a jwt that will contain this data
export const subjects = createSubjects({
    customer: object({
        customerId: string(),
    }),
});
