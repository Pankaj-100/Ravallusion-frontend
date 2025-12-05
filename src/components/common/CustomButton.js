import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export const CustomButton = ({ children, disabled, ...props }) => {
  const { className, onClick } = props;

  const classes = cn(
    "primary-btn rounded-xl border-[1px] border-[var(--neon-purple)] bg-[var(--button-bg)] p-4 px-10 text-base",
    className
  );
  return (
    <Button {...props} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
};

export const GlowButton = ({ children, ...props }) => {
  const { className, onClick } = props;

  const classes = cn(
    "glow-btn relative  inline-flex items-center justify-center text-base py-6 px-10 btn",
    className
  );

  return (
    <CustomButton {...props} className={classes} onClick={onClick}>
  

      {/* Button content */}
      <span className="glow-btn-content relative z-20 flex items-center justify-center">
        {children}
      </span>
    </CustomButton>
  );
};




export const SubmitButton = ({ children, disabled, ...props }) => {
  const { className, onClick } = props;

  const classes = cn(`submit-btn text-base py-6 text-lg btn`, className);
  return (
    <CustomButton
      {...props}
      disabled={disabled}
      className={classes}
      onClick={onClick}
      type="submit"
    >
      {children}
    </CustomButton>
  );
};



