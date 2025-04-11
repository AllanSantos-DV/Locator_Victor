-- Renomear a coluna 'read' para 'is_read' na tabela notifications
-- Primeiro verificamos se a tabela existe
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = (SELECT DATABASE()) AND table_name = 'notifications');

-- Criar procedure para executar apenas se a tabela existir
DELIMITER //
CREATE PROCEDURE rename_read_column_to_is_read()
BEGIN
    IF @table_exists > 0 THEN
        -- Verificar se a coluna 'read' existe (com ou sem escape)
        SET @column_exists = (
            SELECT COUNT(*) 
            FROM information_schema.columns 
            WHERE table_schema = (SELECT DATABASE()) 
            AND table_name = 'notifications' 
            AND (column_name = 'read' OR column_name = '`read`')
        );
        
        -- Se existir, renomeá-la para is_read
        IF @column_exists > 0 THEN
            ALTER TABLE notifications 
            CHANGE COLUMN `read` is_read BOOLEAN NOT NULL DEFAULT FALSE;
        END IF;
    END IF;
END//
DELIMITER ;

-- Executar a procedure
CALL rename_read_column_to_is_read();

-- Limpar
DROP PROCEDURE IF EXISTS rename_read_column_to_is_read; 