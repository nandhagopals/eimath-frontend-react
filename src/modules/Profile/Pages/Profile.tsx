import { Fragment, useState } from "react";
import { Form, FormSubmitHandler, useWatch } from "react-hook-form";
import { useLazyQuery, useMutation } from "@apollo/client";

import { Button } from "components/Buttons";
import { InputField, Mobile } from "components/Form";
import { ConfirmModal } from "components/Modal";

import { useAllowedResource, useAuth, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { messageHelper, somethingWentWrongMessage } from "global/helpers";

import {
  CREATE_HQ_PROFILE_INFORMATION,
  FILTER_HQ_PROFILE_INFORMATION,
  ProfileForm,
  UPDATE_HQ_PROFILE_INFORMATION,
  profileFormSchema,
} from "modules/Profile";
import {
  FILTER_MASTER_FRANCHISEE_INFORMATION,
  UPDATE_MASTER_FRANCHISEE_INFORMATION,
} from "modules/MasterFranchisee";
import { FILTER_FRANCHISEES, UPDATE_FRANCHISEE } from "modules/Franchisee";
import { CountryField } from "modules/Settings/Country";

const userQueryFields = {
  isHQProfileInformationCompanyNameNeed: true,
  isHQProfileInformationCompanyUENNeed: true,
  isHQProfileInformationBankAccountNumberNeed: true,
  isHQProfileInformationEmailNeed: true,
  isHQProfileInformationIsdCountryNeed: true,
  isHQProfileInformationMobileNumberNeed: true,
  isHQProfileInformationAddressNeed: true,
  isHQProfileInformationPostalCodeNeed: true,
  isHQProfileInformationPostalCountryNeed: true,
};

const masterFranchiseQueryFields = {
  isMasterFranchiseeInformationOwnerNameNeed: true,
  isMasterFranchiseeInformationIsdCountryNeed: true,
  isMasterFranchiseeInformationOwnerMobileNumberNeed: true,
  isMasterFranchiseeInformationOwnerEmailNeed: true,
  isMasterFranchiseeInformationCompanyNameNeed: true,
  isMasterFranchiseeInformationCompanyUENNeed: true,
  isMasterFranchiseeInformationBankAccountNumberNeed: true,
  isMasterFranchiseeInformationOwnerPasswordNeed: true,
  isMasterFranchiseeInformationAddressNeed: true,
  isMasterFranchiseeInformationPostalCodeNeed: true,
  isMasterFranchiseeInformationPostalCountryNeed: true,
};

const franchiseQueryFields = {
  isFranchiseeCompanyUENNeed: true,
  isFranchiseeBankAccountNumberNeed: true,
  isFranchiseeCountryNeed: true,
  isFranchiseeOwnerMobileNumberNeed: true,
  isFranchiseeOwnerEmailNeed: true,
  isFranchiseePasswordNeed: true,
  isFranchiseePrefixNeed: true,
  isFranchiseeOwnerNameNeed: true,
  isFranchiseeAddressNeed: true,
  isFranchiseePostalCodeNeed: true,
  isFranchiseePostalCountryNeed: true,
  isFranchiseeFranchiseeCompanyNameNeed: true,
};

const Profile = () => {
  const canUpdate = useAllowedResource("UpdateProfile");
  const auth = useAuth();
  const loginUserType = auth?.authUserDetails?.type;

  const [
    fetchUserDetails,
    { data: userDetailsResponse, loading: userDetailsLoading },
  ] = useLazyQuery(FILTER_HQ_PROFILE_INFORMATION, {
    nextFetchPolicy: "cache-and-network",
  });

  const [
    fetchMasterFranchiseDetails,
    {
      data: masterFranchiseeOwnerDetailsResponse,
      loading: masterFranchiseeOwnerDetailsLoading,
    },
  ] = useLazyQuery(FILTER_MASTER_FRANCHISEE_INFORMATION, {
    nextFetchPolicy: "cache-and-network",
  });

  const [
    fetchFranchiseDetails,
    {
      data: franchiseeOwnerDetailsResponse,
      loading: franchiseeOwnerDetailsLoading,
    },
  ] = useLazyQuery(FILTER_FRANCHISEES, {
    nextFetchPolicy: "cache-and-network",
  });

  const dummyPassword = "pas    s";
  const masterFranchiseeOwnerDetails =
    masterFranchiseeOwnerDetailsResponse?.filterMasterFranchiseeInformation
      ?.edges?.[0]?.node;
  const franchiseeOwnerDetails =
    franchiseeOwnerDetailsResponse?.filterFranchisees?.edges?.[0]?.node;
  const userDetails = userDetailsResponse?.getHQProfiles?.edges?.[0]?.node;
  const [loginUserId, setLoginUserId] = useState<number>(
    loginUserType === "MF Owner"
      ? masterFranchiseeOwnerDetails?.id || -1
      : loginUserType === "Franchisee"
      ? franchiseeOwnerDetails?.id || -1
      : userDetails?.id || -1
  );

  let loginUserDetails = {
    id:
      loginUserType === "MF Owner"
        ? masterFranchiseeOwnerDetails?.id
        : loginUserType === "Franchisee"
        ? franchiseeOwnerDetails?.id
        : userDetails?.id,
    name:
      loginUserType === "MF Owner"
        ? masterFranchiseeOwnerDetails?.ownerName
        : loginUserType === "Franchisee"
        ? franchiseeOwnerDetails?.ownerName
        : userDetails?.name,
    companyName:
      loginUserType === "MF Owner"
        ? masterFranchiseeOwnerDetails?.companyName
        : loginUserType === "Franchisee"
        ? franchiseeOwnerDetails?.companyName
        : null,
    companyUEN:
      loginUserType === "MF Owner"
        ? masterFranchiseeOwnerDetails?.companyUEN
        : loginUserType === "Franchisee"
        ? franchiseeOwnerDetails?.companyUEN
        : null,
    bankAccountNumber:
      loginUserType === "MF Owner"
        ? masterFranchiseeOwnerDetails?.bankAccountNumber?.trim()
        : loginUserType === "Franchisee"
        ? franchiseeOwnerDetails?.bankAccountNumber
        : null,
    country:
      loginUserType === "MF Owner"
        ? masterFranchiseeOwnerDetails?.isdCountry
        : loginUserType === "Franchisee"
        ? franchiseeOwnerDetails?.country
        : userDetails?.country,
    mobileNumber:
      loginUserType === "MF Owner"
        ? masterFranchiseeOwnerDetails?.isdCountry?.id ||
          masterFranchiseeOwnerDetails?.ownerMobileNumber
          ? {
              country: masterFranchiseeOwnerDetails?.isdCountry?.id
                ? {
                    id: masterFranchiseeOwnerDetails?.isdCountry?.id,
                    name:
                      masterFranchiseeOwnerDetails?.isdCountry?.name || "N/A",
                    isdCode:
                      masterFranchiseeOwnerDetails?.isdCountry?.isdCode ||
                      "N/A",
                  }
                : (null as unknown as {
                    id: number;
                    name: string;
                    isdCode: string;
                  }),
              mobileNumber:
                masterFranchiseeOwnerDetails?.ownerMobileNumber ??
                (null as unknown as string),
            }
          : (null as unknown as {
              country: {
                id: number;
                name: string;
                isdCode: string;
              };
              mobileNumber: string;
            })
        : loginUserType === "Franchisee"
        ? franchiseeOwnerDetails?.country?.id ||
          franchiseeOwnerDetails?.ownerMobileNumber
          ? {
              country: franchiseeOwnerDetails?.country?.id
                ? {
                    id: franchiseeOwnerDetails?.country?.id,
                    name: franchiseeOwnerDetails?.country?.name || "N/A",
                    isdCode: franchiseeOwnerDetails?.country?.isdCode || "N/A",
                  }
                : (null as unknown as {
                    id: number;
                    name: string;
                    isdCode: string;
                  }),
              mobileNumber:
                franchiseeOwnerDetails?.ownerMobileNumber ??
                (null as unknown as string),
            }
          : (null as unknown as {
              country: {
                id: number;
                name: string;
                isdCode: string;
              };
              mobileNumber: string;
            })
        : userDetails?.country?.id || userDetails?.mobileNumber
        ? {
            country: userDetails?.country?.id
              ? {
                  id: userDetails?.country?.id,
                  name: userDetails?.country?.name || "N/A",
                  isdCode: userDetails?.country?.isdCode || "N/A",
                }
              : (null as unknown as {
                  id: number;
                  name: string;
                  isdCode: string;
                }),
            mobileNumber:
              userDetails?.mobileNumber ?? (null as unknown as string),
          }
        : (null as unknown as {
            country: {
              id: number;
              name: string;
              isdCode: string;
            };
            mobileNumber: string;
          }),
    email:
      loginUserType === "MF Owner"
        ? masterFranchiseeOwnerDetails?.ownerEmail?.trim()
        : loginUserType === "Franchisee"
        ? franchiseeOwnerDetails?.ownerEmail
        : userDetails?.email,
    password:
      loginUserType === "MF Owner"
        ? masterFranchiseeOwnerDetails?.ownerPassword
          ? dummyPassword
          : (null as unknown as string)
        : loginUserType === "Franchisee"
        ? franchiseeOwnerDetails?.password
          ? dummyPassword
          : (null as unknown as string)
        : userDetails?.password
        ? dummyPassword
        : (null as unknown as string),
    address:
      loginUserType === "MF Owner"
        ? masterFranchiseeOwnerDetails?.address
          ? masterFranchiseeOwnerDetails?.address
          : (null as unknown as string)
        : loginUserType === "Franchisee"
        ? franchiseeOwnerDetails?.address
          ? franchiseeOwnerDetails?.address
          : (null as unknown as string)
        : userDetails?.address
        ? userDetails?.address
        : (null as unknown as string),
    postalCode:
      loginUserType === "MF Owner"
        ? masterFranchiseeOwnerDetails?.postalCode
          ? {
              country: masterFranchiseeOwnerDetails?.postalCountry?.id
                ? {
                    id: masterFranchiseeOwnerDetails?.postalCountry?.id,
                    name:
                      masterFranchiseeOwnerDetails?.postalCountry?.name ||
                      "N/A",
                    isdCode:
                      masterFranchiseeOwnerDetails?.postalCountry?.isdCode ??
                      "N/A",
                  }
                : (null as unknown as {
                    id: number;
                    isdCode: string;
                    name: string;
                  }),
              postalCode:
                masterFranchiseeOwnerDetails?.postalCode ??
                (null as unknown as string),
            }
          : (null as unknown as {
              country: { id: number; isdCode: string; name: string };
              postalCode: string;
            })
        : loginUserType === "Franchisee"
        ? franchiseeOwnerDetails?.postalCode
          ? {
              country: franchiseeOwnerDetails?.postalCountry?.id
                ? {
                    id: franchiseeOwnerDetails?.postalCountry?.id,
                    name: franchiseeOwnerDetails?.postalCountry?.name || "N/A",
                    isdCode:
                      franchiseeOwnerDetails?.postalCountry?.isdCode ?? "N/A",
                  }
                : (null as unknown as {
                    id: number;
                    isdCode: string;
                    name: string;
                  }),
              postalCode:
                franchiseeOwnerDetails?.postalCode ??
                (null as unknown as string),
            }
          : (null as unknown as {
              country: { id: number; isdCode: string; name: string };
              postalCode: string;
            })
        : (null as unknown as {
            country: { id: number; isdCode: string; name: string };
            postalCode: string;
          }),
  };

  const {
    control,
    clearErrors,
    formState: { isValid, dirtyFields },
    resetField,
    reset,
  } = useFormWithZod({
    schema: profileFormSchema,
    defaultValues: async () => {
      const userDetails =
        loginUserType === "User"
          ? await fetchUserDetails({
              variables: {
                filter: undefined,
                ...userQueryFields,
              },
            })
              .then((response) => {
                const res = response?.data?.getHQProfiles?.edges?.[0]?.node;

                if (res?.id) {
                  setLoginUserId(res?.id);
                  return {
                    name: res?.name || "",
                    companyName: res?.companyName || "",
                    companyUEN: res?.companyUEN || "",
                    bankAccountNumber: res?.bankAccountNumber || "",
                    mobileNumber:
                      res?.country?.id || res?.mobileNumber
                        ? {
                            country: res?.country?.id
                              ? {
                                  id: res?.country?.id,
                                  name: res?.country?.name || "N/A",
                                  isdCode: res?.country?.isdCode || "N/A",
                                }
                              : (null as unknown as {
                                  id: number;
                                  name: string;
                                  isdCode: string;
                                }),
                            mobileNumber:
                              res?.mobileNumber ?? (null as unknown as string),
                          }
                        : (null as unknown as {
                            country: {
                              id: number;
                              name: string;
                              isdCode: string;
                            };
                            mobileNumber: string;
                          }),
                    email: res?.email ?? "",
                    password: res?.password
                      ? (dummyPassword as unknown as string)
                      : (null as unknown as string),
                    address: res?.address ?? (null as unknown as string),
                    postalCode: res?.postalCode
                      ? {
                          country: res?.postalCountry?.id
                            ? {
                                id: res?.postalCountry?.id,
                                name: res?.postalCountry?.name || "N/A",
                                isdCode: res?.postalCountry?.isdCode ?? "N/A",
                              }
                            : (null as unknown as {
                                id: number;
                                isdCode: string;
                                name: string;
                              }),
                          postalCode:
                            res?.postalCode ?? (null as unknown as string),
                        }
                      : (null as unknown as {
                          country: {
                            id: number;
                            isdCode: string;
                            name: string;
                          };
                          postalCode: string;
                        }),
                  };
                } else {
                  return null;
                }
              })
              .catch((error) => {
                toastNotification(messageHelper(error));
                return null;
              })
          : loginUserType === "MF Owner"
          ? await fetchMasterFranchiseDetails({
              variables: masterFranchiseQueryFields,
            })
              .then((response) => {
                const res =
                  response?.data?.filterMasterFranchiseeInformation?.edges?.[0]
                    ?.node;

                if (res?.id) {
                  setLoginUserId(res?.id);
                  return {
                    name: res?.ownerName || "",
                    companyName: res?.companyName || "",
                    companyUEN: res?.companyUEN || "",
                    bankAccountNumber: res?.bankAccountNumber || "",
                    mobileNumber:
                      res?.isdCountry?.id || res?.ownerMobileNumber
                        ? {
                            country: res?.isdCountry?.id
                              ? {
                                  id: res?.isdCountry?.id,
                                  name: res?.isdCountry?.name || "N/A",
                                  isdCode: res?.isdCountry?.isdCode || "N/A",
                                }
                              : (null as unknown as {
                                  id: number;
                                  name: string;
                                  isdCode: string;
                                }),
                            mobileNumber:
                              res?.ownerMobileNumber ??
                              (null as unknown as string),
                          }
                        : (null as unknown as {
                            country: {
                              id: number;
                              name: string;
                              isdCode: string;
                            };
                            mobileNumber: string;
                          }),
                    email: res?.ownerEmail ?? "",
                    password: res?.ownerPassword
                      ? dummyPassword
                      : (null as unknown as string),
                    address: res?.address ?? (null as unknown as string),
                    postalCode: res?.postalCode
                      ? {
                          country: res?.postalCountry?.id
                            ? {
                                id: res?.postalCountry?.id,
                                name: res?.postalCountry?.name || "N/A",
                                isdCode: res?.postalCountry?.isdCode ?? "N/A",
                              }
                            : (null as unknown as {
                                id: number;
                                isdCode: string;
                                name: string;
                              }),
                          postalCode:
                            res?.postalCode ?? (null as unknown as string),
                        }
                      : (null as unknown as {
                          country: {
                            id: number;
                            isdCode: string;
                            name: string;
                          };
                          postalCode: string;
                        }),
                  };
                } else {
                  return null;
                }
              })
              .catch((error) => {
                toastNotification(messageHelper(error));
                return null;
              })
          : loginUserType === "Franchisee"
          ? await fetchFranchiseDetails({
              variables: franchiseQueryFields,
            })
              .then((response) => {
                const res = response?.data?.filterFranchisees?.edges?.[0]?.node;

                if (res?.id) {
                  setLoginUserId(res?.id);
                  return {
                    name: res?.ownerName || "",
                    companyName: res?.companyName || "",
                    companyUEN: res?.companyUEN || "",
                    bankAccountNumber: res?.bankAccountNumber || "",
                    mobileNumber:
                      res?.country?.id || res?.ownerMobileNumber
                        ? {
                            country: res?.country?.id
                              ? {
                                  id: res?.country?.id,
                                  name: res?.country?.name || "N/A",
                                  isdCode: res?.country?.isdCode || "N/A",
                                }
                              : (null as unknown as {
                                  id: number;
                                  name: string;
                                  isdCode: string;
                                }),
                            mobileNumber:
                              res?.ownerMobileNumber ??
                              (null as unknown as string),
                          }
                        : (null as unknown as {
                            country: {
                              id: number;
                              name: string;
                              isdCode: string;
                            };
                            mobileNumber: string;
                          }),
                    email: res?.ownerEmail ?? "",
                    password: res?.password
                      ? dummyPassword
                      : (null as unknown as string),
                    address: res?.address ?? (null as unknown as string),
                    postalCode: res?.postalCode
                      ? {
                          country: res?.postalCountry?.id
                            ? {
                                id: res?.postalCountry?.id,
                                name: res?.postalCountry?.name || "N/A",
                                isdCode: res?.postalCountry?.isdCode ?? "N/A",
                              }
                            : (null as unknown as {
                                id: number;
                                isdCode: string;
                                name: string;
                              }),
                          postalCode:
                            res?.postalCode ?? (null as unknown as string),
                        }
                      : (null as unknown as {
                          country: {
                            id: number;
                            isdCode: string;
                            name: string;
                          };
                          postalCode: string;
                        }),
                  };
                } else {
                  return null;
                }
              })
              .catch((error) => {
                toastNotification(messageHelper(error));
                return null;
              })
          : await fetchUserDetails({
              variables: {
                filter: undefined,
                ...userQueryFields,
              },
            })
              .then((response) => {
                const res = response?.data?.getHQProfiles?.edges?.[0]?.node;

                if (res?.id) {
                  setLoginUserId(res?.id);
                  return {
                    name: res?.name || "",
                    companyName: res?.companyName || "",
                    companyUEN: res?.companyUEN || "",
                    bankAccountNumber: res?.bankAccountNumber || "",
                    mobileNumber:
                      res?.country?.id || res?.mobileNumber
                        ? {
                            country: res?.country?.id
                              ? {
                                  id: res?.country?.id,
                                  name: res?.country?.name || "N/A",
                                  isdCode: res?.country?.isdCode || "N/A",
                                }
                              : (null as unknown as {
                                  id: number;
                                  name: string;
                                  isdCode: string;
                                }),
                            mobileNumber:
                              res?.mobileNumber ?? (null as unknown as string),
                          }
                        : (null as unknown as {
                            country: {
                              id: number;
                              name: string;
                              isdCode: string;
                            };
                            mobileNumber: string;
                          }),
                    email: res?.email ?? "",
                    password: res?.password
                      ? dummyPassword
                      : (null as unknown as string),
                    address: res?.address ?? (null as unknown as string),
                    postalCode: res?.postalCode
                      ? {
                          country: res?.postalCountry?.id
                            ? {
                                id: res?.postalCountry?.id,
                                name: res?.postalCountry?.name || "N/A",
                                isdCode: res?.postalCountry?.isdCode ?? "N/A",
                              }
                            : (null as unknown as {
                                id: number;
                                isdCode: string;
                                name: string;
                              }),
                          postalCode:
                            res?.postalCode ?? (null as unknown as string),
                        }
                      : (null as unknown as {
                          country: {
                            id: number;
                            isdCode: string;
                            name: string;
                          };
                          postalCode: string;
                        }),
                  };
                } else {
                  return null;
                }
              })
              .catch((error) => {
                toastNotification(messageHelper(error));
                return null;
              });

      return (
        userDetails || {
          name: loginUserDetails?.name || "",
          companyName: loginUserDetails?.companyName || "",
          companyUEN: loginUserDetails?.companyUEN || "",
          bankAccountNumber: loginUserDetails?.bankAccountNumber || "",
          mobileNumber: loginUserDetails?.mobileNumber,
          email: loginUserDetails?.email ?? "",
          password: loginUserDetails?.password ?? (null as unknown as string),
          address: loginUserDetails?.address ?? (null as unknown as string),
          postalCode: loginUserDetails?.postalCode?.postalCode
            ? {
                country: loginUserDetails?.postalCode?.country?.id
                  ? {
                      id: loginUserDetails?.postalCode?.country?.id,
                      name:
                        loginUserDetails?.postalCode?.country?.name || "N/A",
                      isdCode:
                        loginUserDetails?.postalCode?.country?.isdCode ?? "N/A",
                    }
                  : (null as unknown as {
                      id: number;
                      isdCode: string;
                      name: string;
                    }),
                postalCode:
                  loginUserDetails?.postalCode?.postalCode ??
                  (null as unknown as string),
              }
            : (null as unknown as {
                country: { id: number; isdCode: string; name: string };
                postalCode: string;
              }),
        }
      );
    },
  });

  const [watchPassword] = useWatch({
    control,
    name: ["password"],
  });

  const [showEditForm, setShowEditForm] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const [submitUserForm, { loading: submitUserLoading }] = useMutation(
    UPDATE_HQ_PROFILE_INFORMATION
  );

  const [createUserForm, { loading: createUserLoading }] = useMutation(
    CREATE_HQ_PROFILE_INFORMATION
  );

  const [
    submitMasterFranchiseOwnerForm,
    { loading: submitMasterFranchiseOwnerLoading },
  ] = useMutation(UPDATE_MASTER_FRANCHISEE_INFORMATION);

  const [submitFranchiseOwnerForm, { loading: submitFranchiseOwnerLoading }] =
    useMutation(UPDATE_FRANCHISEE);

  const formSubmitHandler: FormSubmitHandler<ProfileForm> = ({
    data: {
      name,
      companyName,
      companyUEN,
      bankAccountNumber,
      mobileNumber,
      email,
      password,
      address,
      postalCode,
    },
  }) => {
    const profileArgs = {
      name: name?.trim(),
      companyName: companyName?.trim() || "",
      companyUEN: companyUEN?.trim() || "",
      bankAccountNumber: bankAccountNumber?.trim() || undefined,
      isdCountryId: mobileNumber?.country?.id,
      mobileNumber: mobileNumber?.mobileNumber?.toString(),
      email: email?.trim(),
      password:
        loginUserType === "User"
          ? undefined
          : password === dummyPassword
          ? undefined
          : password,
      address: address?.trim(),
      postalCode: postalCode?.postalCode,
      postalCountryId: postalCode?.country?.id,
    };

    if (loginUserType === "MF Owner") {
      if (loginUserId > 0) {
        submitMasterFranchiseOwnerForm({
          variables: {
            id: loginUserId,
            ownerName: profileArgs?.name ?? undefined,
            companyName: profileArgs?.companyName ?? undefined,
            companyUEN: profileArgs?.companyUEN ?? undefined,
            bankAccountNumber: profileArgs?.bankAccountNumber,
            isdCountryId: profileArgs?.isdCountryId,
            ownerMobileNumber: profileArgs?.mobileNumber,
            ownerEmail: profileArgs?.email,
            ownerPassword: profileArgs?.password || undefined,
            address: profileArgs?.address,
            postalCode: profileArgs?.postalCode,
            postalCountryId: profileArgs?.postalCountryId,
            ...masterFranchiseQueryFields,
          },
        })
          .then((response) => {
            if (response?.data?.updateMasterFranchiseeInformation?.id) {
              const res = response?.data?.updateMasterFranchiseeInformation;
              setLoginUserId(res?.id || -1);

              loginUserDetails = {
                id: res?.id,
                name: res?.ownerName,
                companyName: res?.companyName,
                companyUEN: res?.companyUEN,
                bankAccountNumber: res?.bankAccountNumber?.trim(),
                country: res?.isdCountry,
                mobileNumber:
                  res?.isdCountry?.id || res?.ownerMobileNumber
                    ? {
                        country: res?.isdCountry?.id
                          ? {
                              id: res?.isdCountry?.id,
                              name: res?.isdCountry?.name || "N/A",
                              isdCode: res?.isdCountry?.isdCode || "N/A",
                            }
                          : (null as unknown as {
                              id: number;
                              name: string;
                              isdCode: string;
                            }),
                        mobileNumber:
                          res?.ownerMobileNumber ?? (null as unknown as string),
                      }
                    : (null as unknown as {
                        country: {
                          id: number;
                          name: string;
                          isdCode: string;
                        };
                        mobileNumber: string;
                      }),
                email: res?.ownerEmail?.trim(),
                password: res?.ownerPassword
                  ? dummyPassword
                  : (null as unknown as string),
                address: res?.address ?? (null as unknown as string),
                postalCode: res?.postalCode
                  ? {
                      country: res?.postalCountry?.id
                        ? {
                            id: res?.postalCountry?.id,
                            name: res?.postalCountry?.name || "N/A",
                            isdCode: res?.postalCountry?.isdCode ?? "N/A",
                          }
                        : (null as unknown as {
                            id: number;
                            isdCode: string;
                            name: string;
                          }),
                      postalCode:
                        res?.postalCode ?? (null as unknown as string),
                    }
                  : (null as unknown as {
                      country: {
                        id: number;
                        isdCode: string;
                        name: string;
                      };
                      postalCode: string;
                    }),
              };

              setOpenConfirmModal(false);
              setShowEditForm(false);
            } else {
              toastNotification(somethingWentWrongMessage);
              setOpenConfirmModal(false);
            }
          })
          .catch((error) => {
            toastNotification(messageHelper(error));
            setOpenConfirmModal(false);
          });
      }
    } else if (loginUserType === "Franchisee") {
      if (loginUserId > 0) {
        submitFranchiseOwnerForm({
          variables: {
            id: loginUserId,
            ownerName: profileArgs?.name ?? undefined,
            companyName: profileArgs?.companyName ?? undefined,
            companyUEN: profileArgs?.companyUEN ?? undefined,
            bankAccountNumber: profileArgs?.bankAccountNumber,
            countryId: profileArgs?.isdCountryId,
            ownerMobileNumber: profileArgs?.mobileNumber,
            ownerEmail: profileArgs?.email,
            password: profileArgs?.password || undefined,
            address: profileArgs?.address,
            postalCode: profileArgs?.postalCode,
            postalCountryId: profileArgs?.postalCountryId,
            ...masterFranchiseQueryFields,
          },
        })
          .then((response) => {
            if (response?.data?.updateFranchisee?.id) {
              const res = response?.data?.updateFranchisee;
              setLoginUserId(res?.id || -1);

              loginUserDetails = {
                id: res?.id,
                name: res?.ownerName,
                companyName: res?.companyName,
                companyUEN: res?.companyUEN,
                bankAccountNumber: res?.bankAccountNumber?.trim(),
                country: res?.country,
                mobileNumber:
                  res?.country?.id || res?.ownerMobileNumber
                    ? {
                        country: res?.country?.id
                          ? {
                              id: res?.country?.id,
                              name: res?.country?.name || "N/A",
                              isdCode: res?.country?.isdCode || "N/A",
                            }
                          : (null as unknown as {
                              id: number;
                              name: string;
                              isdCode: string;
                            }),
                        mobileNumber:
                          res?.ownerMobileNumber ?? (null as unknown as string),
                      }
                    : (null as unknown as {
                        country: {
                          id: number;
                          name: string;
                          isdCode: string;
                        };
                        mobileNumber: string;
                      }),
                email: res?.ownerEmail?.trim(),
                password: res?.password
                  ? dummyPassword
                  : (null as unknown as string),
                address: res?.address ?? (null as unknown as string),
                postalCode: res?.postalCode
                  ? {
                      country: res?.postalCountry?.id
                        ? {
                            id: res?.postalCountry?.id,
                            name: res?.postalCountry?.name || "N/A",
                            isdCode: res?.postalCountry?.isdCode ?? "N/A",
                          }
                        : (null as unknown as {
                            id: number;
                            isdCode: string;
                            name: string;
                          }),
                      postalCode:
                        res?.postalCode ?? (null as unknown as string),
                    }
                  : (null as unknown as {
                      country: {
                        id: number;
                        isdCode: string;
                        name: string;
                      };
                      postalCode: string;
                    }),
              };

              setOpenConfirmModal(false);
              setShowEditForm(false);
            } else {
              toastNotification(somethingWentWrongMessage);
              setOpenConfirmModal(false);
            }
          })
          .catch((error) => {
            toastNotification(messageHelper(error));
            setOpenConfirmModal(false);
          });
      }
    } else {
      if (loginUserId > 0) {
        submitUserForm({
          variables: {
            id: loginUserId,
            ...profileArgs,
            ...userQueryFields,
          },
        })
          .then((response) => {
            if (response?.data?.updateHQProfile?.id) {
              const res = response?.data?.updateHQProfile;
              setLoginUserId(res?.id || -1);

              loginUserDetails = {
                id: res?.id,
                name: res?.name,
                companyName: res?.companyName,
                companyUEN: res?.companyUEN,
                bankAccountNumber: res?.bankAccountNumber?.trim(),
                country: res?.country,
                mobileNumber:
                  res?.country?.id || res?.mobileNumber
                    ? {
                        country: res?.country?.id
                          ? {
                              id: res?.country?.id,
                              name: res?.country?.name || "N/A",
                              isdCode: res?.country?.isdCode || "N/A",
                            }
                          : (null as unknown as {
                              id: number;
                              name: string;
                              isdCode: string;
                            }),
                        mobileNumber:
                          res?.mobileNumber ?? (null as unknown as string),
                      }
                    : (null as unknown as {
                        country: {
                          id: number;
                          name: string;
                          isdCode: string;
                        };
                        mobileNumber: string;
                      }),
                email: res?.email?.trim(),
                password: res?.password
                  ? dummyPassword
                  : (null as unknown as string),
                address: res?.address ?? (null as unknown as string),
                postalCode: res?.postalCode
                  ? {
                      country: res?.postalCountry?.id
                        ? {
                            id: res?.postalCountry?.id,
                            name: res?.postalCountry?.name || "N/A",
                            isdCode: res?.postalCountry?.isdCode ?? "N/A",
                          }
                        : (null as unknown as {
                            id: number;
                            isdCode: string;
                            name: string;
                          }),
                      postalCode:
                        res?.postalCode ?? (null as unknown as string),
                    }
                  : (null as unknown as {
                      country: {
                        id: number;
                        isdCode: string;
                        name: string;
                      };
                      postalCode: string;
                    }),
              };

              setOpenConfirmModal(false);
              setShowEditForm(false);
            } else {
              toastNotification(somethingWentWrongMessage);
              setOpenConfirmModal(false);
            }
          })
          .catch((error) => {
            toastNotification(messageHelper(error));
            setOpenConfirmModal(false);
          });
      } else {
        createUserForm({
          variables: {
            ...profileArgs,
            ...userQueryFields,
          },
        })
          .then((response) => {
            if (response?.data?.createHQProfile?.id) {
              const res = response?.data?.createHQProfile;
              setLoginUserId(res?.id || -1);

              loginUserDetails = {
                id: res?.id,
                name: res?.name,
                companyName: res?.companyName,
                companyUEN: res?.companyUEN,
                bankAccountNumber: res?.bankAccountNumber?.trim(),
                country: res?.country,
                mobileNumber:
                  res?.country?.id || res?.mobileNumber
                    ? {
                        country: res?.country?.id
                          ? {
                              id: res?.country?.id,
                              name: res?.country?.name || "N/A",
                              isdCode: res?.country?.isdCode || "N/A",
                            }
                          : (null as unknown as {
                              id: number;
                              name: string;
                              isdCode: string;
                            }),
                        mobileNumber:
                          res?.mobileNumber ?? (null as unknown as string),
                      }
                    : (null as unknown as {
                        country: {
                          id: number;
                          name: string;
                          isdCode: string;
                        };
                        mobileNumber: string;
                      }),
                email: res?.email?.trim(),
                password: res?.password
                  ? dummyPassword
                  : (null as unknown as string),
                address: res?.address ?? (null as unknown as string),
                postalCode: res?.postalCode
                  ? {
                      country: res?.postalCountry?.id
                        ? {
                            id: res?.postalCountry?.id,
                            name: res?.postalCountry?.name || "N/A",
                            isdCode: res?.postalCountry?.isdCode ?? "N/A",
                          }
                        : (null as unknown as {
                            id: number;
                            isdCode: string;
                            name: string;
                          }),
                      postalCode:
                        res?.postalCode ?? (null as unknown as string),
                    }
                  : (null as unknown as {
                      country: {
                        id: number;
                        isdCode: string;
                        name: string;
                      };
                      postalCode: string;
                    }),
              };

              setOpenConfirmModal(false);
              setShowEditForm(false);
            } else {
              toastNotification(somethingWentWrongMessage);
              setOpenConfirmModal(false);
            }
          })
          .catch((error) => {
            toastNotification(messageHelper(error));
            setOpenConfirmModal(false);
          });
      }
    }
  };

  const editButtonHandler = () => {
    setShowEditForm(true);
  };

  const saveButtonHandler = () => {
    clearErrors();
    setOpenConfirmModal(true);
  };

  const cancelButtonHandler = () => {
    clearErrors();
    reset();
    setShowEditForm(false);
  };

  const confirmModalCloseButtonHandler = () => {
    setOpenConfirmModal(false);
  };

  const preLoading =
    userDetailsLoading ||
    masterFranchiseeOwnerDetailsLoading ||
    franchiseeOwnerDetailsLoading;

  const submitButtonLoading =
    submitUserLoading ||
    submitMasterFranchiseOwnerLoading ||
    submitFranchiseOwnerLoading ||
    createUserLoading;

  return (
    <div className="md:px-8 md:pt-8 max-w-5xl">
      <p className="font-sunbird font-normal text-[34px] pb-4 md:pb-8 border-b-2 border-b-other-standard-input-line">
        My Profile
      </p>

      <Form
        id="form-submit"
        control={control}
        className="w-full border border-action-hover shadow-card-outline rounded p-4 md:p-12 mt-8 bg-primary-contrast space-y-6"
        onSubmit={formSubmitHandler}
      >
        {preLoading ? (
          Array.from({
            length:
              loginUserType === "MF Owner" || loginUserType === "Franchisee"
                ? 7
                : 4,
          }).map((_, i) => {
            return (
              <div
                key={i}
                className="min-h-[56px] animate-pulse bg-slate-200 rounded-lg"
              />
            );
          })
        ) : (
          <Fragment>
            <InputField
              name={"name"}
              control={control}
              label="Name"
              readOnly={!showEditForm}
            />
            <InputField
              name={"companyName"}
              control={control}
              label="Company Name"
              readOnly={!showEditForm}
            />
            <InputField
              name={"companyUEN"}
              control={control}
              label="Company UEN"
              readOnly={!showEditForm}
            />
            <InputField
              name={"bankAccountNumber"}
              control={control}
              label="Bank Account Number"
              readOnly={!showEditForm}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-x-6 @2xl:gap-x-12 gap-y-6">
              <InputField
                control={control}
                name={"address"}
                label="Address"
                readOnly={!showEditForm}
              />
              <div className={"w-full bg-white"}>
                <div className={"grid grid-cols-2 gap-2.5 items-start"}>
                  <CountryField
                    control={control}
                    name={"postalCode.country"}
                    label="Country"
                    readOnly={!showEditForm}
                    args={{
                      filter: {
                        status: {
                          inArray: ["Active"],
                        },
                      },
                    }}
                  />
                  <InputField
                    control={control}
                    name={"postalCode.postalCode"}
                    label="Postal Code"
                    readOnly={!showEditForm}
                  />
                </div>
              </div>
            </div>
            <Mobile
              control={control}
              name="mobileNumber"
              countryLabel="Country"
              inputLabel="Mobile Number"
              readOnly={!showEditForm}
            />
            <InputField
              name={"email"}
              control={control}
              type="email"
              label="Email"
              readOnly={!showEditForm}
            />
            {loginUserType !== "User" && (
              <InputField
                type="password"
                control={control}
                name="password"
                label="Password"
                readOnly={!showEditForm}
                hideEyeIcon={
                  showEditForm && watchPassword !== dummyPassword ? false : true
                }
                onChange={() => {
                  if (!dirtyFields?.password && showEditForm) {
                    resetField("password", {
                      defaultValue: "" as unknown as string,
                    });
                  }
                }}
              />
            )}
            <div className="flex justify-end">
              {showEditForm && (
                <Button
                  className="w-min bg-none bg-secondary-button mr-2 text-primary-text hover:bg-secondary-button-hover"
                  type="button"
                  onPress={cancelButtonHandler}
                >
                  CANCEL
                </Button>
              )}
              <Button
                className="w-min"
                type={showEditForm && !isValid ? "submit" : "button"}
                onPress={() =>
                  showEditForm
                    ? isValid
                      ? saveButtonHandler()
                      : undefined
                    : editButtonHandler()
                }
                isDisabled={!canUpdate}
              >
                {loginUserId > 0
                  ? showEditForm
                    ? "SAVE"
                    : "EDIT"
                  : showEditForm
                  ? "SAVE"
                  : "CREATE"}
              </Button>
            </div>
          </Fragment>
        )}

        <ConfirmModal
          message={`Confirm ${loginUserId > 0 ? "Edit" : "Create"}?`}
          onClose={confirmModalCloseButtonHandler}
          button={{
            primary: {
              loading: submitButtonLoading,
              type: "submit",
              form: "form-submit",
            },
            secondary: {
              isDisabled: submitButtonLoading,
            },
          }}
          isOpen={openConfirmModal}
          loading={submitButtonLoading}
        />
      </Form>
    </div>
  );
};

export default Profile;
