# Bulk Upload Duplication Toggle Implementation Plan

## Background
Currently, the database requires the `Product Code` to be unique across all products. Because of this, the current bulk upload behavior automatically **overwrites** existing products if it sees a matching code.

You requested a toggle to switch between "Detect Duplicate" and "Do Not Detect Duplicate". 

## Technical Constraint
Because the database strictly enforces that no two products can have the exact same `productCode`, we cannot simply insert two products with `0000` into the database without making a change to either the code or the database structure.

## Proposed Options (User Review Required)

> [!IMPORTANT]
> How would you like the system to handle duplicates when the toggle is set to **"Do Not Detect / Create New"**?

**Option A (Recommended): Auto-Suffix Duplicate Codes**
- **Toggle ON (Detect & Update):** Overwrite the existing product (current behavior).
- **Toggle OFF (Create New):** We append a random or sequential suffix to the code so it saves successfully as a new product (e.g. `0000` becomes `0000-1`).

**Option B: Reject Duplicates with an Error**
- **Toggle ON (Detect & Reject):** If a duplicate code is found, the row fails to upload and you get an error message telling you which row failed.
- **Toggle OFF (Update):** Overwrite the existing product (current behavior).

**Option C: Remove Database Uniqueness**
- We permanently remove the unique restriction from the database.
- **Toggle ON:** Updates the most recently added product with that code.
- **Toggle OFF:** Saves an exact copy with the same product code (e.g. two products both having `0000`). *Note: This requires a database migration and might cause minor issues with search/filtering later.*

## Implementation Details

Once you choose an option, I will:
1. Add a toggle switch to the frontend `ImportData.tsx` (or equivalent admin page).
2. Pass the toggle state to the backend API.
3. Update the `import.processor.ts` logic to handle the duplicates according to your chosen option.
4. (If Option C is chosen) Run a Prisma migration to remove the `@unique` constraint.

## Open Questions

Which option (A, B, or C) do you prefer for handling the duplicate product codes?
