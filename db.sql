use tickets;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `address` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_customers_users1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_customers_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `partners` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_partners_users_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_partners_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NULL,
  `date` TIMESTAMP NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `partner_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_events_partners1_idx` (`partner_id` ASC) VISIBLE,
  CONSTRAINT `fk_events_partners1`
    FOREIGN KEY (`partner_id`)
    REFERENCES `partners` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `location` VARCHAR(45) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `status` ENUM('available', 'sold') NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `event_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_tickets_events1_idx` (`event_id` ASC) VISIBLE,
  CONSTRAINT `fk_tickets_events1`
    FOREIGN KEY (`event_id`)
    REFERENCES `events` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `purchases` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `purchase_date` TIMESTAMP NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'paid', 'error', 'cancelled') NOT NULL,
  `customer_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_purchases_customers1_idx` (`customer_id` ASC) VISIBLE,
  CONSTRAINT `fk_purchases_customers1`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `purchase_tickets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `purchase_id` INT NOT NULL,
  `ticket_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_purchase_tickets_purchases1_idx` (`purchase_id` ASC) VISIBLE,
  INDEX `fk_purchase_tickets_tickets1_idx` (`ticket_id` ASC) VISIBLE,
  CONSTRAINT `fk_purchase_tickets_purchases1`
    FOREIGN KEY (`purchase_id`)
    REFERENCES `purchases` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_purchase_tickets_tickets1`
    FOREIGN KEY (`ticket_id`)
    REFERENCES `tickets` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `reservation_tickets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reservation_date` TIMESTAMP NOT NULL,
  `status` ENUM('reserved', 'cancelled') NOT NULL,
  `reserved_ticket_id` INT GENERATED ALWAYS AS (CASE WHEN status = 'reserved' THEN ticket_id ELSE NULL END) VIRTUAL,
  `ticket_id` INT NOT NULL,
  `customer_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `reserved_ticket_id_UNIQUE` (`reserved_ticket_id` ASC) VISIBLE,
  INDEX `fk_reservation_tickets_tickets1_idx` (`ticket_id` ASC) VISIBLE,
  INDEX `fk_reservation_tickets_customers1_idx` (`customer_id` ASC) VISIBLE,
  CONSTRAINT `fk_reservation_tickets_tickets1`
    FOREIGN KEY (`ticket_id`)
    REFERENCES `tickets` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reservation_tickets_customers1`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB