import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { FeeStatus } from '../utils/enums';

export async function createInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId, amount, dueDate } = req.body;
    const invoiceNo = 'INV-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);

    const receipt = await prisma.feeReceipt.create({
      data: {
        invoiceNo,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        studentId,
      },
    });

    return res.status(201).json(receipt);
  } catch (err) {
    next(err);
  }
}

export async function payFee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params; // feeReceiptId
    const { paymentMethod } = req.body; // UPI, CARD, NETBANKING

    const receipt = await prisma.feeReceipt.update({
      where: { id },
      data: {
        status: FeeStatus.PAID,
        paymentMethod,
        paidAt: new Date(),
        receiptUrl: `/uploads/receipts/${id}-paid.pdf`, // Mock receipt path
      },
    });

    return res.json({ message: 'Payment simulated successfully.', receipt });
  } catch (err) {
    next(err);
  }
}

export async function getStudentFees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { studentId } = req.params;
    const receipts = await prisma.feeReceipt.findMany({
      where: { studentId },
      orderBy: { dueDate: 'asc' },
    });
    return res.json(receipts);
  } catch (err) {
    next(err);
  }
}
