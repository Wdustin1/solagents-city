-- Rename budget_sol to budget_usdc (currency changed from SOL to USDC)
ALTER TABLE jobs RENAME COLUMN budget_sol TO budget_usdc;
