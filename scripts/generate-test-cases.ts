import ExcelJS from 'exceljs';

interface TestCase {
  id: string;
  requirement: string;
  title: string;
  goal: string;
  steps: string[];
  expected: string[];
  priority: 'P1' | 'P2' | 'P3';
  rationale: string;
  automated: boolean;
  file: string;
}

const REQ = {
  login: 'R1: Users can log in; a locked-out account cannot and sees a message',
  cart: 'R2: Catalog shows products; a product can be added to / removed from the cart',
  cartView: 'R3: Cart shows the selected products and their quantity',
  checkout: 'R4: User can check out from the cart, enter shipping details, confirm, and see completion',
  drawer: 'R5: A navigation drawer can be opened and closed and shows store navigation actions',
} as const;

const testCases: TestCase[] = [
  {
    id: 'TC-01',
    requirement: REQ.login,
    title: 'Valid login opens the product catalog',
    goal: 'Confirm the primary entry path to the store works.',
    steps: ['Open the login page', 'Enter valid standard user credentials', 'Submit the form'],
    expected: ['User lands on the product catalog', 'Products are listed'],
    priority: 'P1',
    rationale: 'Every other flow depends on login; a failure here blocks all revenue paths.',
    automated: true,
    file: 'tests/login.spec.ts',
  },
  {
    id: 'TC-02',
    requirement: REQ.login,
    title: 'Locked-out user cannot log in and sees an error',
    goal: 'Confirm a blocked account is rejected with a clear message.',
    steps: ['Open the login page', 'Enter locked-out user credentials', 'Submit the form'],
    expected: ['An error states the user has been locked out', 'User stays on the login page'],
    priority: 'P1',
    rationale: 'Access control: blocked accounts must never reach the catalog, and the user needs feedback.',
    automated: true,
    file: 'tests/login.spec.ts',
  },
  {
    id: 'TC-03',
    requirement: REQ.cart,
    title: 'Adding and removing a product updates the cart badge and button',
    goal: 'Confirm cart state changes are reflected immediately in the catalog.',
    steps: [
      'Log in',
      'Add one product from the catalog',
      'Check the cart badge',
      'Remove the same product from the catalog',
      'Check the cart badge again',
    ],
    expected: [
      'After add: badge shows 1 and the product button offers Remove',
      'After remove: badge is gone and the button offers Add to cart',
    ],
    priority: 'P1',
    rationale: 'Core cart behaviour; both directions are covered because remove is a separate requirement.',
    automated: true,
    file: 'tests/cart.spec.ts',
  },
  {
    id: 'TC-04',
    requirement: REQ.cartView,
    title: 'Cart lists the selected products with their quantity',
    goal: 'Confirm what the user picked is what the cart shows.',
    steps: ['Log in', 'Add two different products', 'Open the cart'],
    expected: ['Badge shows 2', 'Cart lists exactly the two chosen products', 'Each line has quantity 1'],
    priority: 'P1',
    rationale: 'A wrong cart means a wrong order; checks both identity and quantity of items.',
    automated: true,
    file: 'tests/cart.spec.ts',
  },
  {
    id: 'TC-05',
    requirement: REQ.checkout,
    title: 'Full checkout ends with the order-complete message',
    goal: 'Confirm the end-to-end purchase path.',
    steps: [
      'Log in and add a product',
      'Open the cart and start checkout',
      'Fill in first name, last name and postal code',
      'Review the overview and finish',
    ],
    expected: [
      'Overview lists the chosen product',
      'Order-complete confirmation is shown',
      'Cart badge is cleared',
    ],
    priority: 'P1',
    rationale: 'The revenue-critical flow; the one scenario that must never break.',
    automated: true,
    file: 'tests/checkout.spec.ts',
  },
  {
    id: 'TC-06',
    requirement: REQ.checkout,
    title: 'Checkout rejects empty shipping details',
    goal: 'Confirm required shipping data is enforced before an order can proceed.',
    steps: ['Log in and add a product', 'Open the cart and start checkout', 'Continue without filling any field'],
    expected: ['A validation error asks for the first name', 'User stays on the shipping details step'],
    priority: 'P2',
    rationale: 'Main negative path of checkout; prevents orders without delivery data.',
    automated: true,
    file: 'tests/checkout.spec.ts',
  },
  {
    id: 'TC-07',
    requirement: REQ.drawer,
    title: 'Burger button opens the drawer with navigation items',
    goal: 'Confirm the navigation drawer opens and exposes the store actions.',
    steps: ['Log in', 'Click the menu (burger) button'],
    expected: [
      'Drawer is open (not aria-hidden)',
      'All Items, About, Logout and Reset App State are visible',
    ],
    priority: 'P1',
    rationale: 'Explicit requirement; the drawer is the only route to logout.',
    automated: true,
    file: 'tests/navigation.spec.ts',
  },
  {
    id: 'TC-08',
    requirement: REQ.drawer,
    title: 'Drawer closes with the close button',
    goal: 'Confirm the drawer can be dismissed.',
    steps: ['Log in', 'Open the drawer', 'Click the close button'],
    expected: ['Drawer is closed (aria-hidden) and its items are no longer visible'],
    priority: 'P2',
    rationale: 'Open and close are both stated in the requirement; a stuck drawer blocks the page.',
    automated: true,
    file: 'tests/navigation.spec.ts',
  },
  {
    id: 'TC-09',
    requirement: REQ.login,
    title: 'Login with empty credentials shows a validation error',
    goal: 'Confirm missing input is rejected with feedback.',
    steps: ['Open the login page', 'Submit without entering anything'],
    expected: ['An error says username is required', 'User stays on the login page'],
    priority: 'P3',
    rationale: 'Cheap negative case; lower risk than a locked-out account, so not automated first.',
    automated: false,
    file: '',
  },
  {
    id: 'TC-10',
    requirement: REQ.cart,
    title: 'A product can be removed from the cart page',
    goal: 'Confirm removal works from the cart as well as from the catalog.',
    steps: ['Log in', 'Add a product', 'Open the cart', 'Remove the product'],
    expected: ['Cart is empty', 'Badge is gone'],
    priority: 'P2',
    rationale: 'Second entry point for removal; partially covered by TC-03 on the catalog.',
    automated: false,
    file: '',
  },
  {
    id: 'TC-11',
    requirement: REQ.checkout,
    title: 'Overview total equals items plus tax',
    goal: 'Confirm the price summary is arithmetically correct.',
    steps: ['Log in', 'Add two products', 'Go to the checkout overview'],
    expected: ['Item total is the sum of item prices', 'Total equals item total plus tax'],
    priority: 'P2',
    rationale: 'Money calculation; better covered by unit or API tests than through the UI.',
    automated: false,
    file: '',
  },
  {
    id: 'TC-12',
    requirement: REQ.drawer,
    title: 'Logout from the drawer returns to login and protects the catalog',
    goal: 'Confirm a session can be ended and the catalog is no longer reachable.',
    steps: ['Log in', 'Open the drawer', 'Click Logout', 'Navigate directly to the catalog URL'],
    expected: ['Login page is shown', 'Direct catalog access is refused with an error'],
    priority: 'P2',
    rationale: 'Session handling and access control behind a drawer action.',
    automated: false,
    file: '',
  },
  {
    id: 'TC-13',
    requirement: REQ.cartView,
    title: 'Cart contents persist across navigation and reload',
    goal: 'Confirm selected products are not lost when the user moves around.',
    steps: ['Log in', 'Add a product', 'Open the cart', 'Go back to the catalog', 'Reload the page'],
    expected: ['Badge still shows 1', 'Cart still lists the product'],
    priority: 'P3',
    rationale: 'Plausible regression area, but low impact for a demo store; deferred.',
    automated: false,
    file: '',
  },
];

const columns = [
  { header: 'ID', width: 9 },
  { header: 'Requirement', width: 34 },
  { header: 'Title', width: 36 },
  { header: 'Goal', width: 34 },
  { header: 'Steps', width: 44 },
  { header: 'Expected Result', width: 44 },
  { header: 'Priority', width: 10 },
  { header: 'Rationale', width: 44 },
  { header: 'Automated', width: 11 },
  { header: 'Test File', width: 26 },
];

const numbered = (items: string[]): string => items.map((s, i) => `${i + 1}. ${s}`).join('\n');
const bulleted = (items: string[]): string => items.map((s) => `- ${s}`).join('\n');

const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Test Cases', {
  views: [{ state: 'frozen', ySplit: 1 }],
});
sheet.columns = columns.map(({ header, width }) => ({ header, width }));

for (const tc of testCases) {
  sheet.addRow([
    tc.id,
    tc.requirement,
    tc.title,
    tc.goal,
    numbered(tc.steps),
    bulleted(tc.expected),
    tc.priority,
    tc.rationale,
    tc.automated ? 'Yes' : 'No',
    tc.file,
  ]);
}

const header = sheet.getRow(1);
header.height = 24;
header.eachCell((cell) => {
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
});

sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
  if (rowNumber === 1) return;
  row.eachCell((cell) => {
    cell.alignment = { vertical: 'top', wrapText: true };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } } };
  });
});

sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };

await workbook.xlsx.writeFile('test-cases.xlsx');
console.log(`Wrote test-cases.xlsx (${testCases.length} cases)`);
