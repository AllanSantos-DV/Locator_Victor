-- Verificar se a tabela de notificações já existe
-- Se existir, renomear a coluna 'read' para '`read`' (com escape)
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = (SELECT DATABASE()) AND table_name = 'notifications');

-- Criar uma procedure para executar apenas se a tabela existir
DELIMITER //
CREATE PROCEDURE modify_read_column_if_table_exists()
BEGIN
    IF @table_exists > 0 THEN
        -- Primeiro, verifica se a coluna 'read' existe sem escape
        IF EXISTS (SELECT * FROM information_schema.columns WHERE table_schema = (SELECT DATABASE()) AND table_name = 'notifications' AND column_name = 'read') THEN
            -- Primeiro, modifica a estrutura para adicionar uma nova coluna com o nome correto
            ALTER TABLE notifications ADD COLUMN `read_new` BOOLEAN NOT NULL DEFAULT FALSE;
            
            -- Copia os dados da coluna antiga para a nova
            UPDATE notifications SET `read_new` = `read`;
            
            -- Remove a coluna antiga
            ALTER TABLE notifications DROP COLUMN `read`;
            
            -- Renomeia a nova coluna para o nome original, mas com escape
            ALTER TABLE notifications CHANGE COLUMN `read_new` `read` BOOLEAN NOT NULL DEFAULT FALSE;
        END IF;
    END IF;
END//
DELIMITER ;

-- Executar a procedure
CALL modify_read_column_if_table_exists();

-- Limpar
DROP PROCEDURE IF EXISTS modify_read_column_if_table_exists; 