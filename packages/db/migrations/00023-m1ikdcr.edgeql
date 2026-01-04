CREATE MIGRATION m1ikdcrwzylzh3ulpp4mq3raxll7bernaoslrr3cshz7lncw6vjkva
    ONTO m1bb3c4kkwh7y32gxa4zcyjfjmzlqxjfjf35shzecgscx4wppdu4wq
{
  ALTER TYPE shop::dimensions::Threaded RENAME TO shop::dimensions::Thread;
};
