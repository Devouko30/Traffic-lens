import {
  memo, ReactNode, useState, ChangeEvent, FormEvent,
  useEffect, useRef, forwardRef,
} from "react";
import {
  motion, useAnimation, useInView,
  useMotionTemplate, useMotionValue,
} from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/utils";

// ==================== Input ====================
const Input = memo(
  forwardRef(function Input(
    { className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>,
    ref: React.ForwardedRef<HTMLInputElement>
  ) {
    const radius = 100;
    const [visible, setVisible] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`radial-gradient(${
            visible ? radius + "px" : "0px"
          } circle at ${mouseX}px ${mouseY}px, #D4FF33, transparent 80%)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input rounded-lg p-[2px] transition duration-300"
      >
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border-none px-3 py-2 text-sm transition duration-400",
            "bg-white/5 text-white placeholder:text-white/30",
            "focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-[#D4FF33]/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "shadow-[0px_0px_1px_1px_rgba(255,255,255,0.06)]",
            "group-hover/input:shadow-none",
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  })
);
Input.displayName = "Input";

// ==================== Label ====================
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}
const Label = memo(function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none text-white/60 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
});

// ==================== BoxReveal ====================
type BoxRevealProps = {
  children: ReactNode;
  width?: string;
  boxColor?: string;
  duration?: number;
  overflow?: string;
  position?: string;
  className?: string;
};
const BoxReveal = memo(function BoxReveal({
  children,
  width = "fit-content",
  boxColor,
  duration,
  overflow = "hidden",
  position = "relative",
  className,
}: BoxRevealProps) {
  const mainControls = useAnimation();
  const slideControls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      slideControls.start("visible");
      mainControls.start("visible");
    } else {
      slideControls.start("hidden");
      mainControls.start("hidden");
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <section
      ref={ref}
      style={{ position: position as "relative" | "absolute" | "fixed" | "sticky" | "static", width, overflow }}
      className={className}
    >
      <motion.div
        variants={{ hidden: { opacity: 0, y: 75 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: duration ?? 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: "100%" } }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration: duration ?? 0.5, ease: "easeIn" }}
        style={{
          position: "absolute", top: 4, bottom: 4, left: 0, right: 0,
          zIndex: 20, background: boxColor ?? "#D4FF33", borderRadius: 4,
        }}
      />
    </section>
  );
});

// ==================== Ripple ====================
type RippleProps = {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
};
const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className = "",
}: RippleProps) {
  return (
    <section
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden",
        "[mask-image:linear-gradient(to_bottom,black,transparent)]",
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        return (
          <span
            key={i}
            className="absolute animate-ripple rounded-full border border-white/10"
            style={{
              width: `${size}px`, height: `${size}px`,
              opacity, animationDelay,
              borderStyle,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </section>
  );
});

// ==================== OrbitingCircles ====================
type OrbitingCirclesProps = {
  className?: string;
  children: ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
};
const OrbitingCircles = memo(function OrbitingCircles({
  className, children, reverse = false,
  duration = 20, delay = 10, radius = 50, path = true,
}: OrbitingCirclesProps) {
  return (
    <>
      {path && (
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" className="pointer-events-none absolute inset-0 size-full">
          <circle className="stroke-white/10 stroke-1" cx="50%" cy="50%" r={radius} fill="none" />
        </svg>
      )}
      <section
        style={{ "--duration": duration, "--radius": radius, "--delay": -delay } as React.CSSProperties}
        className={cn(
          "absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full",
          "border border-white/10 bg-white/5",
          "[animation-delay:calc(var(--delay)*1000ms)]",
          { "[animation-direction:reverse]": reverse },
          className
        )}
      >
        {children}
      </section>
    </>
  );
});

// ==================== TechOrbitDisplay ====================
type IconConfig = {
  className?: string;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  reverse?: boolean;
  component: () => React.ReactNode;
};
type TechOrbitDisplayProps = {
  iconsArray: IconConfig[];
  text?: string;
};
const TechOrbitDisplay = memo(function TechOrbitDisplay({
  iconsArray,
  text = "Traffic Lens",
}: TechOrbitDisplayProps) {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg">
      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-white to-white/20 bg-clip-text text-center text-6xl font-black leading-none text-transparent">
        {text}
      </span>
      {iconsArray.map((icon, index) => (
        <OrbitingCircles
          key={index}
          className={icon.className}
          duration={icon.duration}
          delay={icon.delay}
          radius={icon.radius}
          path={icon.path}
          reverse={icon.reverse}
        >
          {icon.component()}
        </OrbitingCircles>
      ))}
    </section>
  );
});

// ==================== BottomGradient ====================
const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-[#D4FF33] to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-[#D4FF33]/60 to-transparent" />
  </>
);

// ==================== AnimatedForm ====================
type FieldType = "text" | "email" | "password";
type Field = {
  label: string;
  required?: boolean;
  type: FieldType;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};
type AnimatedFormProps = {
  header: string;
  subHeader?: string;
  fields: Field[];
  submitButton: string;
  textVariantButton?: string;
  errorField?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  goTo?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};
type Errors = { [key: string]: string };

const AnimatedForm = memo(function AnimatedForm({
  header, subHeader, fields, submitButton,
  textVariantButton, errorField, onSubmit, goTo,
}: AnimatedFormProps) {
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const validateForm = (event: FormEvent<HTMLFormElement>) => {
    const currentErrors: Errors = {};
    fields.forEach((field) => {
      const value = (event.target as HTMLFormElement)[field.label]?.value;
      if (field.required && !value) currentErrors[field.label] = `${field.label} is required`;
      if (field.type === "email" && value && !/\S+@\S+\.\S+/.test(value))
        currentErrors[field.label] = "Invalid email address";
      if (field.type === "password" && value && value.length < 6)
        currentErrors[field.label] = "Password must be at least 6 characters";
    });
    return currentErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formErrors = validateForm(event);
    if (Object.keys(formErrors).length === 0) {
      onSubmit(event);
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <section className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <BoxReveal boxColor="#D4FF33" duration={0.3}>
        <h2 className="font-black text-3xl text-white">{header}</h2>
      </BoxReveal>
      {subHeader && (
        <BoxReveal boxColor="#D4FF33" duration={0.3} className="pb-2">
          <p className="text-white/50 text-sm">{subHeader}</p>
        </BoxReveal>
      )}

      <form onSubmit={handleSubmit}>
        <section className="flex flex-col gap-4 mb-4">
          {fields.map((field) => (
            <section key={field.label} className="flex flex-col gap-2">
              <BoxReveal boxColor="#D4FF33" duration={0.3}>
                <Label htmlFor={field.label}>
                  {field.label} <span className="text-[#D4FF33]">*</span>
                </Label>
              </BoxReveal>
              <BoxReveal width="100%" boxColor="#D4FF33" duration={0.3} className="flex flex-col space-y-1 w-full">
                <section className="relative">
                  <Input
                    type={field.type === "password" ? (visible ? "text" : "password") : field.type}
                    id={field.label}
                    placeholder={field.placeholder}
                    onChange={field.onChange}
                  />
                  {field.type === "password" && (
                    <button
                      type="button"
                      onClick={() => setVisible((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/70 transition-colors"
                    >
                      {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  )}
                </section>
                <section className="h-4">
                  {errors[field.label] && (
                    <p className="text-red-400 text-xs">{errors[field.label]}</p>
                  )}
                </section>
              </BoxReveal>
            </section>
          ))}
        </section>

        {errorField && (
          <BoxReveal width="100%" boxColor="#D4FF33" duration={0.3}>
            <p className="text-red-400 text-sm mb-4">{errorField}</p>
          </BoxReveal>
        )}

        <BoxReveal width="100%" boxColor="#D4FF33" duration={0.3} overflow="visible">
          <button
            className="relative group/btn w-full h-10 rounded-md font-black text-sm tracking-widest uppercase bg-[#D4FF33] text-[#0A0A0A] hover:shadow-[0_0_24px_rgba(212,255,51,0.5)] hover:scale-[1.02] transition-all duration-200 outline-none cursor-pointer"
            type="submit"
          >
            {submitButton} →
            <BottomGradient />
          </button>
        </BoxReveal>

        {textVariantButton && goTo && (
          <BoxReveal boxColor="#D4FF33" duration={0.3}>
            <section className="mt-4 text-center">
              <button
                className="text-sm text-[#D4FF33]/70 hover:text-[#D4FF33] transition-colors outline-none cursor-pointer"
                onClick={goTo}
              >
                {textVariantButton}
              </button>
            </section>
          </BoxReveal>
        )}
      </form>
    </section>
  );
});

export { Input, BoxReveal, Ripple, OrbitingCircles, TechOrbitDisplay, AnimatedForm, Label, BottomGradient };
