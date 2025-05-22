"use client";

import { Button, Input } from "@/components/atoms";
import { FormLabel } from "@/components/molecules";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms";
import { useFormik } from "formik";
import * as Yup from "yup";

const ProfileSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
});

export function ProfileForm() {
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    validationSchema: ProfileSchema,
    onSubmit: (values) => {
      console.log(values);
      // Here you would typically save to your backend
      alert("Profile updated successfully!");
    },
  });

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and contact details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FormLabel htmlFor="firstName">First Name</FormLabel>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.firstName}
                className={
                  formik.errors.firstName && formik.touched.firstName ? "border-red-500" : ""
                }
              />
              {formik.errors.firstName && formik.touched.firstName ? (
                <p className="text-sm text-red-500">{formik.errors.firstName}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="lastName">Last Name</FormLabel>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.lastName}
                className={
                  formik.errors.lastName && formik.touched.lastName ? "border-red-500" : ""
                }
              />
              {formik.errors.lastName && formik.touched.lastName ? (
                <p className="text-sm text-red-500">{formik.errors.lastName}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={formik.errors.email && formik.touched.email ? "border-red-500" : ""}
            />
            {formik.errors.email && formik.touched.email ? (
              <p className="text-sm text-red-500">{formik.errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="phone">Phone Number</FormLabel>
            <Input
              id="phone"
              name="phone"
              placeholder="(123) 456-7890"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
              className={formik.errors.phone && formik.touched.phone ? "border-red-500" : ""}
            />
            {formik.errors.phone && formik.touched.phone ? (
              <p className="text-sm text-red-500">{formik.errors.phone}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="address">Address</FormLabel>
            <Input
              id="address"
              name="address"
              placeholder="1234 Main St"
              onChange={formik.handleChange}
              value={formik.values.address}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <FormLabel htmlFor="city">City</FormLabel>
              <Input
                id="city"
                name="city"
                placeholder="Anytown"
                onChange={formik.handleChange}
                value={formik.values.city}
              />
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="state">State</FormLabel>
              <Input
                id="state"
                name="state"
                placeholder="CA"
                onChange={formik.handleChange}
                value={formik.values.state}
              />
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="zipCode">Zip Code</FormLabel>
              <Input
                id="zipCode"
                name="zipCode"
                placeholder="12345"
                onChange={formik.handleChange}
                value={formik.values.zipCode}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
