import { body, validationResult } from "express-validator";

export function handleValidation(req, res, next){
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const msg = errors.array().map(e=>e.msg).join(", ");
    return res.status(400).json({ success:false, data:null, message: msg });
  }
  next();
}

export const menuValidators = {
  create: [
    body("name").trim().isLength({min:2,max:80}).withMessage("Nama 2-80 karakter").escape(),
    body("price").isInt({min:0,max:10000000}).withMessage("Harga 0-10jt").toInt(),
    body("category_id").optional({nullable:true}).isUUID().withMessage("category_id harus UUID"),
    body("is_available").optional().isBoolean().withMessage("is_available boolean"),
    handleValidation
  ],
  update: [
    body("name").optional().trim().isLength({min:2,max:80}).withMessage("Nama 2-80 karakter").escape(),
    body("price").optional().isInt({min:0,max:10000000}).withMessage("Harga 0-10jt").toInt(),
    body("category_id").optional({nullable:true}).isUUID().withMessage("category_id harus UUID"),
    body("is_available").optional().isBoolean(),
    handleValidation
  ]
};

export const orderValidators = {
  create: [
    body("customer_name").trim().isLength({min:2,max:60}).withMessage("Nama pelanggan 2-60 karakter").escape(),
    body("table_id").isUUID().withMessage("table_id harus UUID"),
    body("items").isArray({min:1,max:20}).withMessage("items 1-20"),
    body("items.*.menu_item_id").isUUID().withMessage("menu_item_id harus UUID"),
    body("items.*.qty").isInt({min:1,max:50}).withMessage("qty 1-50").toInt(),
    body("items.*.note").optional({nullable:true}).trim().isLength({max:120}).withMessage("note max 120").escape(),
    handleValidation
  ],
  status: [
    body("status").isIn(["pending","cooking","ready","cancelled"]).withMessage("Status tidak valid (paid via payments)"),
    handleValidation
  ]
};

export const paymentValidators = [
  body("order_id").isUUID().withMessage("order_id harus UUID"),
  body("method").isIn(["cash","qris","debit"]).withMessage("method cash/qris/debit"),
  body("amount").isInt({min:0,max:100000000}).withMessage("amount tidak valid").toInt(),
  handleValidation
];
